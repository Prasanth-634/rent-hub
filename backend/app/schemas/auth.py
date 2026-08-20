from typing import Optional, Any
from pydantic import BaseModel, EmailStr, ConfigDict


class LandlordRegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    organization_name: Optional[str] = None


class LenderRegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    organization_name: Optional[str] = None


class TenantRegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    phone: Optional[str] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AdminLoginRequest(BaseModel):
    email: EmailStr
    password: str
    two_factor_code: Optional[str] = None


class RefreshRequest(BaseModel):
    refresh_token: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


class AuthUserData(BaseModel):
    id: str
    name: str
    email: str
    role: str
    organization_id: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class LoginData(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: AuthUserData


class AuthSuccessResponse(BaseModel):
    success: bool = True
    message: str = "Success"
    data: Optional[LoginData] = None


class AuthErrorResponse(BaseModel):
    success: bool = False
    message: str
    error_code: str = "INVALID_CREDENTIALS"


class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    is_active: bool
    organization_id: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class GoogleLoginRequest(BaseModel):
    id_token: str
