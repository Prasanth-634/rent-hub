from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


class AnalyzeTransactionRequest(BaseModel):
    transaction_id: Optional[str] = None
    description: Optional[str] = ""
    amount_minor_units: int = Field(..., gt=0, description="Amount in minor units (e.g., paise/cents)")
    expected_rent_minor_units: int = Field(default=2500000, gt=0, description="Expected monthly rent in minor units")
    day_of_month: Optional[int] = Field(default=1, ge=1, le=31)
    due_day: Optional[int] = Field(default=1, ge=1, le=31)
    payer: Optional[str] = ""
    payee: Optional[str] = ""
    transaction_date: Optional[str] = None


class AnalyzeTransactionResponse(BaseModel):
    transaction_id: Optional[str] = None
    classification: str = Field(..., description="RENT or NON_RENT")
    confidence_score: float = Field(..., ge=0.0, le=1.0)
    is_anomaly: bool
    anomaly_score: float
    review_reason: Optional[str] = None
    model_version: str = "rent-classifier-v1"
    anomaly_model_version: str = "anomaly-detector-v1"


class AnalyzeVerificationRequest(BaseModel):
    verification_id: str


class AnalyzeVerificationResponse(BaseModel):
    verification_id: str
    total_transactions: int
    rent_transactions_count: int
    non_rent_transactions_count: int
    anomalies_count: int
    overall_confidence: float
    verification_status: str  # VERIFIED, REVIEW, FAILED, PENDING_CONSENT
    review_recommendation: str
    results: List[AnalyzeTransactionResponse]


class AITransactionResultDetail(BaseModel):
    id: str
    transaction_id: str
    verification_id: str
    classification: str
    classification_confidence: float
    is_anomaly: bool
    anomaly_score: float
    review_reason: Optional[str] = None
    model_version: str
    anomaly_model_version: str
    created_at: datetime

    class Config:
        from_attributes = True


class VerificationAIResultsResponse(BaseModel):
    verification_id: str
    summary: Dict[str, Any]
    transactions: List[Dict[str, Any]]


class AdminAIMonitoringStats(BaseModel):
    total_transactions_processed: int
    rent_classifications_count: int
    non_rent_classifications_count: int
    anomalies_detected_count: int
    model_version: str
    anomaly_model_version: str
    failed_predictions_count: int
    average_processing_time_ms: float
    last_retrained_at: Optional[datetime] = None
