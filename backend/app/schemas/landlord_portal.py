from typing import Any,  List, Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field


class LandlordDashboardCardResponse(BaseModel):
    total_properties: int
    active_tenants: int
    active_leases: int
    pending_verifications: int
    verified_tenants: int
    monthly_rent_minor_units: int
    monthly_rent_formatted: str


class LandlordPropertyCreate(BaseModel):
    name: str
    property_type: str = "APARTMENT"  # APARTMENT, SINGLE_FAMILY, COMMERCIAL, MULTI_FAMILY
    address_line1: str
    city: str
    state: str
    postal_code: str
    country: str = "IN"
    number_of_units: int = 1


class LandlordPropertyUpdate(BaseModel):
    name: Optional[str] = None
    property_type: Optional[str] = None
    address_line1: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None
    number_of_units: Optional[int] = None
    status: Optional[str] = None  # ACTIVE, INACTIVE, ARCHIVED


class LandlordPropertyResponse(BaseModel):
    id: str
    name: str
    property_type: str
    address_line1: str
    city: str
    state: str
    postal_code: str
    country: str
    number_of_units: int
    status: str
    tenants_count: int
    monthly_rent_formatted: str
    created_at: str

    class Config:
        from_attributes = True


class LandlordTenantCreate(BaseModel):
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    property_id: str
    unit_number: Optional[str] = None
    lease_start_date: str
    lease_end_date: str
    monthly_rent_minor_units: int


class LandlordTenantResponse(BaseModel):
    id: str
    full_name: str
    email: str
    phone: Optional[str] = None
    property_name: str
    property_id: str
    unit_number: Optional[str] = None
    lease_id: Optional[str] = None
    monthly_rent_formatted: str
    lease_status: str
    verification_status: str
    created_at: str

    class Config:
        from_attributes = True


class LandlordLeaseCreate(BaseModel):
    tenant_id: str
    property_id: str
    unit_number: Optional[str] = None
    monthly_rent_minor_units: int = Field(..., gt=0)
    security_deposit_minor_units: Optional[int] = 0
    due_day: int = Field(1, ge=1, le=31)
    payment_frequency: str = "MONTHLY"
    start_date: str
    end_date: str


class LandlordLeaseUpdate(BaseModel):
    monthly_rent_minor_units: Optional[int] = None
    due_day: Optional[int] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    status: Optional[str] = None  # ACTIVE, EXPIRED, UPCOMING, TERMINATED


class LandlordLeaseResponse(BaseModel):
    id: str
    tenant_name: str
    tenant_id: str
    property_name: str
    property_id: str
    unit_number: Optional[str] = None
    monthly_rent_formatted: str
    security_deposit_formatted: str
    start_date: str
    end_date: str
    due_day: int
    payment_frequency: str
    status: str

    class Config:
        from_attributes = True


class LandlordVerificationCreate(BaseModel):
    tenant_id: str
    property_id: str
    lease_id: str
    period_start: str
    period_end: str
    purpose: str = "Verify tenant rental payment history."
    data_required: List[str] = ["Rental transactions", "Payment dates", "Amounts"]


class LandlordVerificationResponse(BaseModel):
    id: str
    external_id: str
    tenant_name: str
    property_name: str
    period: str
    monthly_rent_formatted: str
    consent_status: str
    verification_status: str
    created_date: str
    credits_remaining: Optional[int] = None
    message: Optional[str] = "Verification request created successfully"
    ai_result_summary: Optional[str] = "Waiting for Consent"
    ai_status: Optional[str] = "PENDING_CONSENT"

    class Config:
        from_attributes = True


class LandlordVerificationDetailResponse(BaseModel):
    id: str
    external_id: str
    tenant_name: str
    property_name: str
    lease_id: str
    period: str
    monthly_rent_formatted: Optional[str] = None
    request_date: str
    consent_status: str
    verification_status: str
    expected_payments: int
    verified_payments: int
    on_time_payments: int
    late_payments: int
    partial_payments: int
    missed_payments: int
    possible_duplicates: int
    rent_transactions_count: int
    non_rent_transactions_count: int
    anomaly_count: int
    ai_confidence_formatted: str
    ai_summary_text: str

    class Config:
        from_attributes = True


class LandlordReportResponse(BaseModel):
    id: str
    tenant_name: str
    property_name: str
    period: str
    status: str
    created_date: str

    class Config:
        from_attributes = True


class LandlordReportDetailResponse(BaseModel):
    id: str
    verification_id: str
    tenant_name: str
    tenant_email: str
    tenant_phone: Optional[str] = None
    property_name: str
    property_address: str
    lease_id: str
    monthly_rent_formatted: str
    period: str
    created_date: str
    status: str
    expected_rent_formatted: str
    verified_rent_formatted: str
    payment_history: List[dict]
    verification_summary: str
    ai_findings: List[str]
    anomaly_indicators: List[str]
    final_verification_status: str

    class Config:
        from_attributes = True


class LandlordAPIUsageResponse(BaseModel):
    api_status: str
    requests_today: int
    monthly_requests: int
    remaining_credits: int
    rate_limit: str
    api_errors: int


class LandlordAPIKeyCreate(BaseModel):
    name: str = "Landlord Integration Key"


class LandlordAPIKeyResponse(BaseModel):
    id: str
    key_prefix: str
    masked_key: str
    name: str
    status: str
    created_at: str

    class Config:
        from_attributes = True


class LandlordAPIKeyCreatedResponse(BaseModel):
    id: str
    key_prefix: str
    raw_api_key_secret: str
    name: str
    status: str
    created_at: str
    security_warning: str = "Save this API secret key now. It will NEVER be displayed again."


class LandlordCreditTransactionResponse(BaseModel):
    id: str
    type: str
    amount: int
    balance_after: int
    reference_id: Optional[str] = None
    description: Optional[str] = None
    created_at: str

    class Config:
        from_attributes = True


class LandlordCreditResponse(BaseModel):
    verification_credits: int
    credit_type: str
    credits_used: int
    credits_remaining: int

class LandlordBillingResponse(BaseModel):
    current_plan: Any = None
    verification_credits: Optional[int] = 0
    credit_type: Optional[str] = "SEEDED"
    credits_used: Optional[int] = 0
    credits_used_this_month: Optional[int] = 0
    credits_remaining: Optional[int] = 0
    renewal_date: Optional[str] = ""
    payment_history: List[Any] = []
    credit_transactions: List[Any] = []

    class Config:
        extra = "allow" 


class LandlordNotificationResponse(BaseModel):
    id: str
    title: str
    message: str
    is_read: bool
    created_at: str

    class Config:
        from_attributes = True


class LandlordProfileResponse(BaseModel):
    id: str
    full_name: str
    business_name: str
    email: str
    phone: Optional[str] = None
    role: str
    is_active: bool

    class Config:
        from_attributes = True


class LandlordProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    business_name: Optional[str] = None
    phone: Optional[str] = None
    password: Optional[str] = None



class LandlordCreateOrderRequest(BaseModel):
    credit_package_id: str = "5000"


class LandlordCreateOrderResponse(BaseModel):
    success: bool = True
    order_id: str
    amount_minor_units: int
    amount_formatted: str
    credits_to_add: int
    currency: str = "INR"
    package_name: str
    upi_qr_svg: Optional[str] = None


class LandlordPaymentReceiptResponse(BaseModel):
    receipt_id: str
    payment_id: str
    order_id: str
    landlord_name: str
    organization_name: str
    package_name: str
    credits_purchased: int
    amount_formatted: str
    currency: str
    status: str
    payment_date: str

