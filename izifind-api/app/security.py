from datetime import datetime, timedelta
from hashlib import sha256
from typing import Optional
import secrets

import bcrypt
from jose import jwt

from .config import settings

_BCRYPT_SHA256_PREFIX = "bcrypt_sha256$"
_LEGACY_BCRYPT_PREFIXES = ("$2a$", "$2b$", "$2x$", "$2y$")


def _password_bytes(password: str) -> bytes:
    return password.encode("utf-8")


def _bcrypt_sha256_bytes(password: str) -> bytes:
    return sha256(_password_bytes(password)).digest()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    # New hashes are stored as "bcrypt_sha256$<bcrypt hash>".
    if hashed_password.startswith(_BCRYPT_SHA256_PREFIX):
        encoded_hash = hashed_password[len(_BCRYPT_SHA256_PREFIX) :].encode("utf-8")
        return bcrypt.checkpw(_bcrypt_sha256_bytes(plain_password), encoded_hash)

    # Legacy hashes are plain bcrypt strings from passlib/db seeds.
    # bcrypt enforces a 72-byte limit, so we truncate only for those hashes
    # to preserve compatibility with already-stored passwords.
    if hashed_password.startswith(_LEGACY_BCRYPT_PREFIXES):
        return bcrypt.checkpw(_password_bytes(plain_password)[:72], hashed_password.encode("utf-8"))

    return False


def get_password_hash(password: str) -> str:
    hashed = bcrypt.hashpw(_bcrypt_sha256_bytes(password), bcrypt.gensalt())
    return f"{_BCRYPT_SHA256_PREFIX}{hashed.decode('utf-8')}"


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def generate_reset_token() -> tuple[str, str]:
    """
    Génère un token de réinitialisation de mot de passe.
    
    Returns:
        Tuple de (plain_token, hashed_token)
        - plain_token: À envoyer à l'utilisateur via email
        - hashed_token: À stocker en base de données
    """
    plain_token = secrets.token_urlsafe(32)
    # Hash le token avec bcrypt pour le stocker en BD
    hashed_token = bcrypt.hashpw(plain_token.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    return plain_token, hashed_token


def verify_reset_token(plain_token: str, hashed_token: str) -> bool:
    """
    Vérifie qu'un token de réinitialisation correspond à son hash stocké.
    
    Args:
        plain_token: Token fourni par l'utilisateur
        hashed_token: Hash stocké en base de données
    
    Returns:
        True si les tokens correspondent
    """
    try:
        return bcrypt.checkpw(plain_token.encode("utf-8"), hashed_token.encode("utf-8"))
    except (ValueError, TypeError):
        return False
