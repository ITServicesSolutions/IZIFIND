from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import or_
from sqlalchemy.orm import Session
from typing import Any
from datetime import datetime, timedelta
from email_validator import validate_email, EmailNotValidError
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token as google_id_token
import secrets
import logging

from ..database import get_db
from ..models.auth import User, PasswordResetToken
from ..schemas.auth import UserCreate, User as UserSchema, Token, UserUpdate, ChangePassword, ForgotPasswordRequest, ResetPasswordRequest, GoogleAuthRequest
from ..security import (
    get_password_hash, verify_password, create_access_token,
    generate_reset_token, verify_reset_token
)
from ..dependencies import get_current_user
from ..utils.email import send_password_reset_email
from ..utils.rate_limiter import limiter
from ..config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/auth", tags=["Auth"])


def _clean_phone(phone: str | None) -> str | None:
    if phone is None:
        return None
    value = phone.strip()
    return value or None


def _ensure_unique_user_fields(
    db: Session,
    *,
    username: str | None = None,
    email: str | None = None,
    phone: str | None = None,
    exclude_user_id: int | None = None,
) -> None:
    if username is not None:
        query = db.query(User).filter(User.username == username)
        if exclude_user_id is not None:
            query = query.filter(User.id != exclude_user_id)
        if query.first():
            raise HTTPException(status_code=400, detail="Username already taken")

    if email is not None:
        query = db.query(User).filter(User.email == email)
        if exclude_user_id is not None:
            query = query.filter(User.id != exclude_user_id)
        if query.first():
            raise HTTPException(status_code=400, detail="Email already taken")

    phone = _clean_phone(phone)
    if phone is not None:
        query = db.query(User).filter(User.phone == phone)
        if exclude_user_id is not None:
            query = query.filter(User.id != exclude_user_id)
        if query.first():
            raise HTTPException(status_code=400, detail="Phone already taken")

@router.post(
    "/register", 
    response_model=UserSchema,
    summary="Inscription d'un utilisateur",
    description="Permet de créer un nouveau compte utilisateur."
)
def register(user_in: UserCreate, db: Session = Depends(get_db)) -> Any:
    phone = _clean_phone(user_in.phone)
    _ensure_unique_user_fields(
        db,
        username=user_in.username,
        email=str(user_in.email),
        phone=phone,
    )
    
    user = User(
        username=user_in.username,
        email=str(user_in.email),
        phone=phone,
        hashed_password=get_password_hash(user_in.password),
        commissariat_id=user_in.commissariat_id,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.post(
    "/login", 
    response_model=Token,
    summary="Connexion utilisateur",
    description="Authentifie l'utilisateur et retourne un token JWT. Rate limited: 5/minute."
)
@limiter.limit("5/minute")
def login(request: Request, db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()) -> Any:
    identifier = form_data.username.strip()
    user = db.query(User).filter(
        or_(
            User.username == identifier,
            User.email == identifier,
            User.phone == identifier,
        )
    ).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    elif not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}


@router.post(
    "/google",
    response_model=Token,
    summary="Connexion Google",
    description="Verifie un ID token Google, cree ou retrouve l'utilisateur, puis retourne un JWT IZIFIND."
)
def google_login(payload: GoogleAuthRequest, db: Session = Depends(get_db)) -> Any:
    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=503, detail="Google authentication is not configured")

    try:
        claims = google_id_token.verify_oauth2_token(
            payload.id_token,
            google_requests.Request(),
            settings.GOOGLE_CLIENT_ID,
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid Google token")

    email = claims.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Google token does not contain an email")
    if claims.get("email_verified") is False:
        raise HTTPException(status_code=400, detail="Google email is not verified")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        base_username = (claims.get("name") or email.split("@")[0]).lower()
        base_username = "".join(ch if ch.isalnum() or ch in ("_", "-") else "_" for ch in base_username).strip("_")
        if not base_username:
            base_username = "google_user"

        username = base_username[:80]
        suffix = 1
        while db.query(User).filter(User.username == username).first():
            suffix += 1
            username = f"{base_username[:70]}_{suffix}"

        user = User(
            username=username,
            email=email,
            hashed_password=get_password_hash(secrets.token_urlsafe(32)),
            is_active=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")

    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get(
    "/me", 
    response_model=UserSchema,
    summary="Profil de l'utilisateur",
    description="Renvoie les informations de l'utilisateur actuellement connecté."
)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user


# ═══════════════════════════════════════════════════════════
#  PASSWORD RECOVERY & CHANGE
# ═══════════════════════════════════════════════════════════

@router.post(
    "/forgot-password",
    summary="Demander une réinitialisation de mot de passe",
    description="[ANONYME] Envoie un lien de réinitialisation par email. Rate limited: 3/minute."
)
@limiter.limit("3/minute")
def forgot_password(
    request: Request,
    payload: ForgotPasswordRequest,
    db: Session = Depends(get_db)
):
    """
    Endpoint pour demander la réinitialisation du mot de passe.
    Valide l'email et envoie un lien de reset si l'account existe.
    """
    email = payload.email
    logger.info(f"Forgot password request for email: {email}")
    
    # Validation email (Pydantic already validates it's an email, but let's keep extra validation just in case
    try:
        validate_email(email)
    except EmailNotValidError:
        raise HTTPException(
            status_code=400,
            detail="Email format invalid"
        )
    
    # Vérifier que l'utilisateur existe
    user = db.query(User).filter(User.email == email).first()
    if not user:
        logger.info(f"No user found for email: {email} - not sending email")
        # Pour la sécurité, ne pas révéler si l'email existe ou non
        return {
            "message": "Si un compte existe avec cet email, un lien de réinitialisation a été envoyé."
        }
    
    if not user.is_active:
        logger.info(f"User {email} is inactive - not sending email")
        return {
            "message": "Si un compte existe avec cet email, un lien de réinitialisation a été envoyé."
        }
    
    logger.info(f"User {email} found and active - proceeding with password reset")
    
    # Générer le token
    plain_token, hashed_token = generate_reset_token()
    expires_at = datetime.utcnow() + timedelta(hours=settings.PASSWORD_RESET_TOKEN_EXPIRE_HOURS)
    
    # Supprimer les anciens tokens non utilisés de cet utilisateur
    db.query(PasswordResetToken).filter(
        PasswordResetToken.user_id == user.id,
        PasswordResetToken.is_used == False
    ).delete()
    
    # Créer le nouveau token
    reset_token = PasswordResetToken(
        user_id=user.id,
        token=hashed_token,
        expires_at=expires_at
    )
    db.add(reset_token)
    db.commit()
    
    # Construire l'URL de reset
    reset_url = f"{settings.FRONTEND_URL}/reset-password?token={plain_token}"
    
    # Envoyer l'email
    logger.info(f"Sending password reset email to {email}")
    email_sent = send_password_reset_email(
        to_email=user.email,
        username=user.username,
        reset_url=reset_url
    )
    
    if not email_sent:
        logger.warning(f"Failed to send reset email to {user.email}, but token was stored")
    else:
        logger.info(f"Password reset email successfully sent to {user.email}")
    
    return {
        "message": "Si un compte existe avec cet email, un lien de réinitialisation a été envoyé."
    }


@router.post(
    "/reset-password",
    summary="Réinitialiser le mot de passe avec token",
    description="[ANONYME] Réinitialise le mot de passe en utilisant le token envoyé par email."
)
def reset_password(
    payload: ResetPasswordRequest,
    db: Session = Depends(get_db)
):
    """
    Endpoint pour réinitialiser le mot de passe avec le token reçu par email.
    """
    token = payload.token
    new_password = payload.new_password
    # Validation de la nouvelle password
    if len(new_password) < 8:
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 8 characters long"
        )
    
    # Trouver le token
    reset_token_record = db.query(PasswordResetToken).filter(
        PasswordResetToken.is_used == False
    ).all()
    
    # Vérifier chaque token non utilisé
    valid_token = None
    for record in reset_token_record:
        if verify_reset_token(token, record.token):
            valid_token = record
            break
    
    reset_token_record = valid_token
    
    if not reset_token_record:
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired reset token"
        )
    
    # Vérifier l'expiration
    if datetime.utcnow() > reset_token_record.expires_at:
        reset_token_record.is_used = True
        db.commit()
        raise HTTPException(
            status_code=400,
            detail="Reset token has expired"
        )
    
    # Vérifier le token
    if not verify_reset_token(token, reset_token_record.token):
        logger.warning(f"Invalid reset token attempt for user {reset_token_record.user_id}")
        raise HTTPException(
            status_code=400,
            detail="Invalid reset token"
        )
    
    # Mettre à jour le mot de passe
    user = reset_token_record.user
    user.hashed_password = get_password_hash(new_password)
    reset_token_record.is_used = True
    
    db.add(user)
    db.add(reset_token_record)
    db.commit()
    
    logger.info(f"Password reset successfully for user {user.username}")
    
    return {
        "message": "Mot de passe réinitialisé avec succès. Vous pouvez maintenant vous connecter."
    }


@router.put(
    "/me",
    response_model=UserSchema,
    summary="Modifier son propre profil",
    description="[AUTH REQUISE] Permet à un utilisateur de modifier ses propres informations (sans changer son rôle/permissions)."
)
def update_me(
    user_in: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Endpoint pour que l'utilisateur modifie son propre profil.
    Il ne peut pas modifier son rôle, ses permissions ou son statut superutilisateur.
    """
    # Mettre à jour les champs fournis
    if user_in.username is not None:
        _ensure_unique_user_fields(db, username=user_in.username, exclude_user_id=current_user.id)
        current_user.username = user_in.username
    
    if user_in.email is not None:
        email = str(user_in.email)
        _ensure_unique_user_fields(db, email=email, exclude_user_id=current_user.id)
        current_user.email = email

    if user_in.phone is not None:
        phone = _clean_phone(user_in.phone)
        _ensure_unique_user_fields(db, phone=phone, exclude_user_id=current_user.id)
        current_user.phone = phone
    
    if user_in.commissariat_id is not None:
        current_user.commissariat_id = user_in.commissariat_id
    
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user

@router.post(
    "/change-password",
    summary="Changer le mot de passe (utilisateur connecté)",
    description="[AUTH REQUISE] Permet à un utilisateur connecté de changer son mot de passe. Rate limited: 5/minute."
)
@limiter.limit("5/minute")
def change_password(
    request: Request,
    password_data: ChangePassword,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Endpoint pour changer le mot de passe d'un utilisateur connecté.
    Demande le mot de passe actuel pour validation.
    """
    # Validation de la nouvelle password
    if len(password_data.new_password) < 8:
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 8 characters long"
        )
    
    if password_data.old_password == password_data.new_password:
        raise HTTPException(
            status_code=400,
            detail="New password must be different from current password"
        )
    
    # Vérifier le mot de passe actuel
    if not verify_password(password_data.old_password, current_user.hashed_password):
        logger.warning(f"Failed password change attempt for user {current_user.username}")
        raise HTTPException(
            status_code=401,
            detail="Current password is incorrect"
        )
    
    # Mettre à jour le mot de passe
    current_user.hashed_password = get_password_hash(password_data.new_password)
    db.add(current_user)
    db.commit()
    
    logger.info(f"Password changed successfully for user {current_user.username}")
    
    return {
        "message": "Mot de passe changé avec succès"
    }
