import hashlib
import hmac
import secrets
import bcrypt
from datetime import datetime, timedelta
from typing import Optional, Union, Any
from jose import jwt, JWTError
from app.core.config import settings


def get_password_hash(password: str) -> str:
    pwd_bytes = password.encode('utf-8')[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    pwd_bytes = plain_password.encode('utf-8')[:72]
    hash_bytes = hashed_password.encode('utf-8')
    try:
        return bcrypt.checkpw(pwd_bytes, hash_bytes)
    except Exception:
        return False


def create_access_token(
    user_id: str,
    role: str,
    organization_id: Optional[str] = None,
    token_version: int = 1,
    expires_delta: Optional[timedelta] = None
) -> str:
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {
        "exp": expire,
        "sub": str(user_id),
        "role": str(role),
        "organization_id": str(organization_id) if organization_id else "",
        "token_version": int(token_version),
        "type": "access"
    }
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt


def create_refresh_token(
    user_id: str,
    token_version: int = 1,
    expires_delta: Optional[timedelta] = None
) -> str:
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    
    to_encode = {
        "exp": expire,
        "sub": str(user_id),
        "token_version": int(token_version),
        "type": "refresh"
    }
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt


def decode_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except JWTError:
        return None


def generate_api_key() -> tuple[str, str, str]:
    prefix = "rv_" + secrets.token_hex(4)
    secret = secrets.token_urlsafe(32)
    full_key = f"{prefix}.{secret}"
    secret_hash = hashlib.sha256(full_key.encode()).hexdigest()
    return prefix, full_key, secret_hash


def hash_api_key(full_key: str) -> str:
    return hashlib.sha256(full_key.encode()).hexdigest()


def verify_api_key_hash(full_key: str, secret_hash: str) -> bool:
    calc_hash = hashlib.sha256(full_key.encode()).hexdigest()
    return hmac.compare_digest(calc_hash, secret_hash)
