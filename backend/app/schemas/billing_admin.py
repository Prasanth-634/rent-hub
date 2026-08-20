from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr, ConfigDict


class SubscriptionPlanResponse(BaseModel):
    id: str
    name: str
    price_minor_units: int
    currency: str
    monthly_request_limit: int
    active: bool

    model_config = ConfigDict(from_attributes=True)


class CheckoutRequest(BaseModel):
    plan_id: str


class CheckoutResponse(BaseModel):
    order_id: str
    amount_minor_units: int
    currency: str
    razorpay_key_id: str


class APIKeyCreate(BaseModel):
    name: Optional[str] = "Default API Key"


class APIKeyResponse(BaseModel):
    id: str
    key_prefix: str
    full_key: Optional[str] = None  # Only returned on creation
    status: str
    created_at: datetime
    last_used_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class AuditLogResponse(BaseModel):
    id: str
    actor_user_id: Optional[str] = None
    action: str
    resource_type: str
    resource_id: Optional[str] = None
    metadata_json: Optional[Dict[str, Any]] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AdminUserUpdate(BaseModel):
    role: Optional[str] = None
    is_active: Optional[bool] = None


class CreateOrderRequest(BaseModel):
    package_name: str
    amount: float
    credits: int
    currency: Optional[str] = "INR"


class CreateOrderResponse(BaseModel):
    success: bool = True
    order_id: str
    payment_id: str
    amount: float
    currency: str
    credits: int
    qr_code_url: str
    upi_string: str
    status: str = "PENDING"


class PaymentStatusResponse(BaseModel):
    success: bool
    status: str
    credits_added: Optional[int] = None
    payment_id: Optional[str] = None
    order_id: Optional[str] = None
    message: str


class AdminUserDetail(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    is_active: bool
    status: str = "ACTIVE"
    created_at: Optional[datetime] = None
    # Organization fields (for LANDLORD / LENDER)
    organization_id: Optional[str] = None
    organization_name: Optional[str] = None
    organization_type: Optional[str] = None
    # Tenant profile fields (for TENANT)
    phone: Optional[str] = None
    # Stats
    verification_count: int = 0

    model_config = ConfigDict(from_attributes=True)


class AdminProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    organization_name: Optional[str] = None
    address: Optional[str] = None
    is_active: Optional[bool] = None


class AdminPasswordReset(BaseModel):
    new_password: str


class AdminRoleChange(BaseModel):
    new_role: str
    reason: str  # Required: must explain why


class AdminUserActionResponse(BaseModel):
    success: bool = True
    message: str
    user_id: str
    action: str


class AdminPropertyCreate(BaseModel):
    name: str
    address_line1: str
    city: str
    state: str
    postal_code: str
    country: Optional[str] = "IN"
    property_type: Optional[str] = "APARTMENT"
    number_of_units: Optional[int] = 1
    organization_id: Optional[str] = None


class AdminPropertyUpdate(BaseModel):
    name: Optional[str] = None
    address_line1: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None
    property_type: Optional[str] = None
    number_of_units: Optional[int] = None
    status: Optional[str] = None
    organization_id: Optional[str] = None


class AdminPropertyResponse(BaseModel):
    id: str
    name: str
    address_line1: str
    city: str
    state: str
    postal_code: str
    country: str
    property_type: str
    number_of_units: int
    occupied_units: int = 0
    verified_units: int = 0
    status: str
    organization_id: str
    organization_name: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AdminLeaseCreate(BaseModel):
    tenant_id: str
    property_id: str
    unit_id: Optional[str] = None
    organization_id: Optional[str] = None
    monthly_rent: float
    start_date: str
    end_date: str
    status: Optional[str] = "ACTIVE"


class AdminLeaseUpdate(BaseModel):
    tenant_id: Optional[str] = None
    property_id: Optional[str] = None
    unit_id: Optional[str] = None
    organization_id: Optional[str] = None
    monthly_rent: Optional[float] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    status: Optional[str] = None


class AdminLeaseResponse(BaseModel):
    id: str
    tenant_id: str
    tenant_name: str
    tenant_email: str
    property_id: str
    property_name: str
    unit_id: Optional[str] = None
    unit_name: Optional[str] = None
    organization_id: str
    organization_name: Optional[str] = None
    monthly_rent: float
    monthly_rent_formatted: str
    start_date: datetime
    end_date: datetime
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AdminVerificationDetail(BaseModel):
    id: str
    landlord_name: str
    landlord_org_id: str
    tenant_name: str
    tenant_id: str
    property_name: str
    monthly_rent_formatted: str
    period: str
    consent_status: str
    status: str
    ai_status: str
    ai_confidence: Optional[float] = None
    is_anomaly: Optional[bool] = None
    anomaly_score: Optional[float] = None
    credits_used: int = 1
    report_status: Optional[str] = "NOT_GENERATED"
    last_updated_at: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AdminAPIKeyDetail(BaseModel):
    id: str
    organization_id: str
    organization_name: str
    organization_type: str
    key_prefix: str
    status: str
    created_at: datetime
    last_used_at: Optional[datetime] = None
    verification_credits: int = 0
    total_requests: int = 0

    model_config = ConfigDict(from_attributes=True)
