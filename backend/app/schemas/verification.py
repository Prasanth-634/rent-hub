from datetime import datetime
from typing import Optional, List, Any, Dict
from pydantic import BaseModel, ConfigDict


class VerificationCreate(BaseModel):
    tenant_id: str
    lease_id: str
    period_start: datetime
    period_end: datetime


class ConsentAction(BaseModel):
    scope: str = "RENT_VERIFICATION"


class ConsentResponse(BaseModel):
    id: str
    verification_id: str
    tenant_id: str
    status: str
    scope: str
    granted_at: Optional[datetime] = None
    revoked_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class TransactionResponse(BaseModel):
    id: str
    verification_id: str
    external_transaction_id: Optional[str] = None
    transaction_date: datetime
    amount_minor_units: int
    currency: str
    description: Optional[str] = None
    payer: Optional[str] = None
    payee: Optional[str] = None
    is_rent_predicted: bool
    rent_probability: float
    anomaly_score: float
    anomaly_flag: bool

    model_config = ConfigDict(from_attributes=True)


class VerificationResultResponse(BaseModel):
    id: str
    verification_id: str
    months_expected: int
    months_matched: int
    on_time_count: int
    late_count: int
    partial_count: int
    missed_count: int
    duplicate_count: int
    confidence_level: float
    status: str
    explanation_json: Optional[Dict[str, Any]] = None
    finalized_at: datetime

    model_config = ConfigDict(from_attributes=True)


class VerificationDetailResponse(BaseModel):
    id: str
    external_id: str
    requester_organization_id: str
    tenant_id: str
    lease_id: str
    period_start: datetime
    period_end: datetime
    status: str
    created_at: datetime
    completed_at: Optional[datetime] = None
    result: Optional[VerificationResultResponse] = None
    consents: List[ConsentResponse] = []

    model_config = ConfigDict(from_attributes=True)


class ClassifyTransactionRequest(BaseModel):
    amount_minor_units: int
    expected_rent_minor_units: int
    day_of_month: int
    due_day: int
    description: str
    payee: str


class ClassifyTransactionResponse(BaseModel):
    is_rent: bool
    confidence: float
    features_used: Dict[str, Any]


class DetectAnomalyRequest(BaseModel):
    amount_ratio: float
    payment_interval_days: int
    monthly_payment_count: int
    days_late: int
    amount_deviation: float


class DetectAnomalyResponse(BaseModel):
    anomaly_flag: bool
    anomaly_score: float
