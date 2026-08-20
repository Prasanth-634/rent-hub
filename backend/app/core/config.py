import os
from typing import List, Optional
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
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
    ]

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.MODEL_DIR, exist_ok=True)
