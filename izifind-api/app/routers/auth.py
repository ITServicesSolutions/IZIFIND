from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import or_
from sqlalchemy.orm import Session
from typing import Any
from datetime import datetime, timedelta
from email_validator import validate_email, EmailNotValidError
import logging

from ..database import get_db
from ..models.auth import User, PasswordResetToken
from ..schemas.auth import UserCreate, User as UserSchema, Token
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

@router.post(
    "/register", 
    response_model=UserSchema,
    summary="Inscription d'un utilisateur",
    description="Permet de créer un nouveau compte utilisateur."
)
def register(user_in: UserCreate, db: Session = Depends(get_db)) -> Any:
    user = db.query(User).filter(User.username == user_in.username).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this username already exists in the system.",
        )
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
    
    user = User(
        username=user_in.username,
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
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
    user = db.query(User).filter(
        or_(
            User.username == form_data.username,
            User.email == form_data.username,
        )
    ).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    elif not user.is_active:
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
    email: str,
    db: Session = Depends(get_db)
):
    """
    Endpoint pour demander la réinitialisation du mot de passe.
    Valide l'email et envoie un lien de reset si l'account existe.
    """
    # Validation email
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
        # Pour la sécurité, ne pas révéler si l'email existe ou non
        return {
            "message": "Si un compte existe avec cet email, un lien de réinitialisation a été envoyé."
        }
    
    if not user.is_active:
        return {
            "message": "Si un compte existe avec cet email, un lien de réinitialisation a été envoyé."
        }
    
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
    email_sent = send_password_reset_email(
        to_email=user.email,
        username=user.username,
        reset_url=reset_url
    )
    
    if not email_sent:
        logger.warning(f"Failed to send reset email to {user.email}, but token was stored")
    
    return {
        "message": "Si un compte existe avec cet email, un lien de réinitialisation a été envoyé."
    }


@router.post(
    "/reset-password",
    summary="Réinitialiser le mot de passe avec token",
    description="[ANONYME] Réinitialise le mot de passe en utilisant le token envoyé par email."
)
def reset_password(
    token: str,
    new_password: str,
    db: Session = Depends(get_db)
):
    """
    Endpoint pour réinitialiser le mot de passe avec le token reçu par email.
    """
    # Validation de la nouvelle password
    if len(new_password) < 8:
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 8 characters long"
        )
    
    # Trouver le token
    reset_token_record = db.query(PasswordResetToken).filter(
        PasswordResetToken.is_used == False
    ).first()
    
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


@router.post(
    "/change-password",
    summary="Changer le mot de passe (utilisateur connecté)",
    description="[AUTH REQUISE] Permet à un utilisateur connecté de changer son mot de passe. Rate limited: 5/minute."
)
@limiter.limit("5/minute")
def change_password(
    request: Request,
    current_password: str,
    new_password: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Endpoint pour changer le mot de passe d'un utilisateur connecté.
    Demande le mot de passe actuel pour validation.
    """
    # Validation de la nouvelle password
    if len(new_password) < 8:
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 8 characters long"
        )
    
    if current_password == new_password:
        raise HTTPException(
            status_code=400,
            detail="New password must be different from current password"
        )
    
    # Vérifier le mot de passe actuel
    if not verify_password(current_password, current_user.hashed_password):
        logger.warning(f"Failed password change attempt for user {current_user.username}")
        raise HTTPException(
            status_code=401,
            detail="Current password is incorrect"
        )
    
    # Mettre à jour le mot de passe
    current_user.hashed_password = get_password_hash(new_password)
    db.add(current_user)
    db.commit()
    
    logger.info(f"Password changed successfully for user {current_user.username}")
    
    return {
        "message": "Mot de passe changé avec succès"
    }
