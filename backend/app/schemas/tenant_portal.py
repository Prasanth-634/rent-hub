from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr


class TenantDashboardCardResponse(BaseModel):
    pending_requests_count: int
    consent_required_count: int
    completed_verifications_count: int
    rental_payments_count: int


class TenantVerificationRequestResponse(BaseModel):
    id: str
    external_id: str
    requested_by: str
    organization_type: str
    property_address: str
    period_start: str
    period_end: str
    purpose: str
    request_date: str
    expiry_date: Optional[str] = None
    status: str  # PENDING_CONSENT, CONSENT_GRANTED, UPLOAD_PENDING, PROCESSING, COMPLETED, REJECTED, EXPIRED

    class Config:
        from_attributes = True


class TenantVerificationDetailResponse(BaseModel):
    id: str
    external_id: str
    requested_by: str
    organization_name: str
    organization_type: str
    purpose: str
    period_start: str
    period_end: str
    property_address: str
    monthly_rent: str
    data_requested: List[str]
    privacy_notice: str
    status: str
    consent_id: Optional[str] = None

    class Config:
        from_attributes = True


class TenantTransactionResponse(BaseModel):
    id: str
    date: str
    description: str
    amount: float
    currency: str
    payment_type: str
    payment_status: str
    verification_status: str

    class Config:
        from_attributes = True


class TransactionUploadRowError(BaseModel):
    row_number: int
    transaction_id: Optional[str] = None
    error_reason: str


class TransactionUploadStepResponse(BaseModel):
    total_uploaded: int
    valid_count: int
    invalid_count: int
    invalid_rows: List[TransactionUploadRowError]
    verification_id: str
    status: str


class TenantVerificationHistoryItem(BaseModel):
    verification_id: str
    requested_by: str
    period: str
    status: str  # VERIFIED, REQUIRES_REVIEW, UNVERIFIED, REJECTED
    completed_date: Optional[str] = None
    expected_payments: int
    verified_payments: int
    late_payments: int
    partial_payments: int
    missed_payments: int
    simple_explanation: str

    class Config:
        from_attributes = True


class TenantNotificationResponse(BaseModel):
    id: str
    title: str
    message: str
    is_read: bool
    created_at: str

    class Config:
        from_attributes = True


class TenantProfileResponse(BaseModel):
    id: str
    full_name: str
    email: str
    phone: Optional[str] = None
    is_active: bool
    created_at: str

    class Config:
        from_attributes = True


class TenantProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    password: Optional[str] = None


class TenantCurrentRentResponse(BaseModel):
    property_name: str
    landlord_name: str
    monthly_rent: int
    monthly_rent_formatted: str
    next_due_date: str
    due_date_iso: str
    rent_period: str
    payment_status: str
    paid_date: Optional[str] = None
    receipt_id: Optional[str] = None
    payment_id: Optional[str] = None


class TenantCreatePaymentOrderRequest(BaseModel):
    payment_method: str = "UPI"


class TenantPaymentOrderResponse(BaseModel):
    order_id: str
    payment_id: str
    amount: int
    amount_formatted: str
    currency: str
    key_id: str
    receipt_id: str
    status: str


class TenantRentPaymentItemResponse(BaseModel):
    id: str
    rent_period: str
    property_name: str
    landlord_name: str
    amount: int
    amount_formatted: str
    due_date: str
    paid_date: Optional[str] = None
    payment_method: str
    status: str
    days_late: Optional[int] = 0
    receipt_id: Optional[str] = None


class TenantReceiptResponse(BaseModel):
    title: str = "RENT PAYMENT RECEIPT"
    receipt_id: str
    tenant_name: str
    property_name: str
    landlord_name: str
    rent_period: str
    amount: int
    amount_formatted: str
    payment_date: str
    payment_method: str
    payment_status: str
    razorpay_payment_id: str
    razorpay_order_id: str

