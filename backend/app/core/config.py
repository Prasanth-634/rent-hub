import json
import os
from typing import List, Optional, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Rent Verification API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Security
    JWT_SECRET: str = "super-secret-rent-verification-jwt-key-2026-change-in-prod"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Database
    DATABASE_URL: str = "sqlite:///./rent_verification.db"

    @field_validator("DATABASE_URL", mode="before")
    def assemble_db_connection(cls, v: Optional[str]) -> str:
        if isinstance(v, str) and v.startswith("postgres://"):
            return v.replace("postgres://", "postgresql://", 1)
        return v or "sqlite:///./rent_verification.db"
    
    # Redis & Celery
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # Razorpay
    RAZORPAY_KEY_ID: str = "rzp_test_placeholder"
    RAZORPAY_KEY_SECRET: str = "placeholder_secret"
    
    # Email / SMTP
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USERNAME: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    SMTP_FROM: str = "noreply@rentverify.com"
    
    # Storage & Uploads
    UPLOAD_DIR: str = "./uploads"
    MODEL_DIR: str = "./ml_models"
    
    # CORS
    CORS_ORIGINS: Union[List[str], str] = [
        "https://rent-hub-mauve.vercel.app",
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000"
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    def parse_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        default_origins = [
            "https://rent-hub-mauve.vercel.app",
            "http://localhost:5173",
            "http://localhost:3000",
            "http://127.0.0.1:5173",
            "http://127.0.0.1:3000"
        ]
        origins: List[str] = []
        if isinstance(v, str):
            if v.startswith("[") and v.endswith("]"):
                try:
                    parsed = json.loads(v)
                    origins = [str(item).strip().rstrip('/') for item in parsed if str(item).strip()]
                except Exception:
                    origins = [i.strip().rstrip('/') for i in v.split(",") if i.strip()]
            else:
                origins = [i.strip().rstrip('/') for i in v.split(",") if i.strip()]
        elif isinstance(v, list):
            origins = [str(i).strip().rstrip('/') for i in v if str(i).strip()]

        # Filter out wildcard '*' to comply with allow_credentials=True
        valid_origins = [o for o in origins if o != "*"]
        
        # Ensure default production and local origins are present
        for default in default_origins:
            if default not in valid_origins:
                valid_origins.append(default)

        return valid_origins

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")



settings = Settings()

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.MODEL_DIR, exist_ok=True)
