import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # ── Security ───────────────────────────────────────────────
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080  # 7 days
    PASSWORD_RESET_TOKEN_EXPIRE_HOURS: int = 24
    ALLOWED_HOSTS: str = "localhost,127.0.0.1"
    
    @property
    def allowed_hosts_list(self) -> list:
        """Parse ALLOWED_HOSTS from comma-separated string to list"""
        return [host.strip() for host in self.ALLOWED_HOSTS.split(',') if host.strip()]
    
    # ── Database ───────────────────────────────────────────────
    DATABASE_ENGINE: str = "sqlite"
    DATABASE_NAME: str = "db.sqlite3"
    DATABASE_USER: str = "postgres"
    DATABASE_PASSWORD: str = "password"
    DATABASE_HOST: str = "localhost"
    DATABASE_PORT: str = "5432"

    # ── Email (SMTP) ───────────────────────────────────────────
    SMTP_SERVER: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SENDER_EMAIL: str = ""
    SENDER_NAME: str = "IZIFIND API"
    FRONTEND_URL: str = "http://localhost:3000"

    @property
    def DATABASE_URL(self) -> str:
        if self.DATABASE_ENGINE == "postgres" or self.DATABASE_ENGINE == "postgresql":
            return f"postgresql://{self.DATABASE_USER}:{self.DATABASE_PASSWORD}@{self.DATABASE_HOST}:{self.DATABASE_PORT}/{self.DATABASE_NAME}"
        return f"sqlite:///./{self.DATABASE_NAME}"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    def __init__(self, **data):
        super().__init__(**data)
        # Validation: SECRET_KEY est obligatoire
        if not self.SECRET_KEY or self.SECRET_KEY == "":
            raise ValueError(
                "SECRET_KEY is required and must be set in .env file. "
                "Generate one with: python -c 'import secrets; print(secrets.token_urlsafe(32))'"
            )

settings = Settings()
