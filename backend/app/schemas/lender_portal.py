from typing import Optional, List, Any
from datetime import datetime
from pydantic import BaseModel, EmailStr, ConfigDict


class LenderDashboardMetrics(BaseModel):
    total_verification_requests: int
    verified: int
    pending_consent: int
    processing: int
    needs_review: int
    api_usage_current: int
    api_usage_limit: int


class LenderVerificationRequestCreate(BaseModel):
    tenant_full_name: str
    tenant_email: EmailStr
    tenant_phone: Optional[str] = None
    period_start: str  # YYYY-MM-DD
    period_end: str    # YYYY-MM-DD
    purpose: str
    reference_id: Optional[str] = None


class LenderVerificationRequestResponse(BaseModel):
    id: str
    tenant_name: str
    tenant_email: str
    verification_period: str
    purpose: str
    consent_status: str  # PENDING, APPROVED, REJECTED, REVOKED, EXPIRED
    verification_status: str  # PENDING_CONSENT, CONSENT_GRANTED, PROCESSING, VERIFIED, REVIEW, FAILED, EXPIRED
    created_at: str

    model_config = ConfigDict(from_attributes=True)


class PaymentSummaryData(BaseModel):
    expected_payments: int
    verified_payments: int
    on_time: int
    late: int
    partial: int
    missed: int


class AISignalsData(BaseModel):
    rent_transactions_detected: int
    non_rent_transactions: int
    anomalies_detected: int
    ai_signal: str  # e.g., "High Confidence", "Review Recommended"
    explanation: str


class LenderVerificationDetailResponse(BaseModel):
    id: str
    tenant_name: str
    tenant_email: str
    tenant_phone: Optional[str] = None
    request_date: str
    purpose: str
    verification_period: str
    consent_status: str
    verification_status: str
    payment_summary: Optional[PaymentSummaryData] = None
    ai_signals: Optional[AISignalsData] = None
    monthly_rent_formatted: Optional[str] = None
    expected_total_formatted: Optional[str] = None
    verified_total_formatted: Optional[str] = None
    disclaimer: str = "Rental verification information is provided for assessment purposes and should be considered alongside your organization's normal lending policies and checks."


class LenderReportResponse(BaseModel):
    id: str
    tenant_name: str
    period: str
    verification_status: str
    created_date: str
    completed_date: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class LenderReportDetailResponse(BaseModel):
    id: str
    tenant_name: str
    tenant_email: str
    organization_name: str
    period: str
    verification_status: str
    created_date: str
    completed_date: Optional[str] = None
    payment_summary: PaymentSummaryData
    ai_signals: AISignalsData
    monthly_rent_formatted: str
    expected_total_formatted: str
    verified_total_formatted: str
    disclaimer: str = "Rental verification information is provided for assessment purposes and should be considered alongside your organization's normal lending policies and checks."


class LenderAPIUsageResponse(BaseModel):
    api_status: str
    requests_today: int
    monthly_requests: int
    remaining_credits: int
    rate_limit: str
    successful_requests: int
    failed_requests: int
    avg_response_time_ms: int


class LenderAPIKeyResponse(BaseModel):
    id: str
    key_prefix: str
    masked_key: str
    status: str
    created_at: str
    raw_api_key_secret: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class LenderAPIKeyCreateRequest(BaseModel):
    name: Optional[str] = "Lender Integration Key"


class PaymentHistoryItemResponse(BaseModel):
    id: str
    amount_formatted: str
    package_name: str
    credits_added: int
    status: str
    date: str


class LenderBillingResponse(BaseModel):
    current_plan: str
    verification_credits: int
    credits_used: int
    credits_remaining: int
    renewal_date: str
    payment_history: List[PaymentHistoryItemResponse]


class LenderNotificationResponse(BaseModel):
    id: str
    title: str
    message: str
    type: str
    is_read: bool
    created_at: str

    model_config = ConfigDict(from_attributes=True)


class LenderProfileResponse(BaseModel):
    id: str
    full_name: str
    email: str
    phone: Optional[str] = None
    organization_name: str
    organization_type: str
    role: str

    model_config = ConfigDict(from_attributes=True)


class LenderProfileUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    organization_name: Optional[str] = None
    phone: Optional[str] = None
    new_password: Optional[str] = None
