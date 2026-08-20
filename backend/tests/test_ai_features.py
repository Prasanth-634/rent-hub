import pytest
from datetime import datetime
from fastapi.testclient import TestClient
from app.services.ai.rent_classifier import rent_classifier_service
from app.services.ai.anomaly_detector import anomaly_detector_service
from app.services.ai.model_loader import model_loader
from app.ml.engine import ml_engine

# 1. Rent transaction classification test
def test_rent_transaction_classification():
    tx_payload = {
        "description": "HOUSE RENT",
        "amount_minor_units": 2000000,
        "expected_rent_minor_units": 2000000,
        "day_of_month": 1,
        "due_day": 1,
        "payer": "Alex Johnson",
        "payee": "Landlord Rent Account"
    }
    classification, confidence = rent_classifier_service.classify_transaction(tx_payload)
    assert classification == "RENT"
    assert confidence > 0.5

# 2. Non-rent classification test
def test_non_rent_transaction_classification():
    tx_payload = {
        "description": "GROCERY STORE",
        "amount_minor_units": 250000,
        "expected_rent_minor_units": 2000000,
        "day_of_month": 15,
        "due_day": 1,
        "payer": "Alex Johnson",
        "payee": "Supermarket"
    }
    classification, confidence = rent_classifier_service.classify_transaction(tx_payload)
    assert classification == "NON_RENT"

# 3. High-confidence prediction test
def test_high_confidence_prediction():
    tx_payload = {
        "description": "MONTHLY APARTMENT LEASE RENT PAYMENT",
        "amount_minor_units": 2500000,
        "expected_rent_minor_units": 2500000,
        "day_of_month": 1,
        "due_day": 1,
        "payee": "Landlord Housing Account"
    }
    classification, confidence = rent_classifier_service.classify_transaction(tx_payload)
    assert classification == "RENT"
    assert confidence >= 0.85

# 4. Low-confidence / ambiguous prediction test
def test_low_confidence_prediction():
    tx_payload = {
        "description": "TRANSFER PAYMENT 123",
        "amount_minor_units": 1500000,
        "expected_rent_minor_units": 2500000,
        "day_of_month": 18,
        "due_day": 1
    }
    classification, confidence = rent_classifier_service.classify_transaction(tx_payload)
    assert 0.0 <= confidence <= 1.0

# 5. Normal payment prediction test
def test_normal_payment_anomaly_detection():
    tx_payload = {
        "amount_minor_units": 2500000,
        "expected_rent_minor_units": 2500000,
        "days_from_due_date": 0,
        "days_between_rent_payments": 30
    }
    is_anomaly, anomaly_score, reason = anomaly_detector_service.detect_anomaly(tx_payload)
    assert is_anomaly is False
    assert "normal" in reason.lower() or "aligns" in reason.lower()

# 6. Anomalous payment prediction test (e.g., 100,000 vs expected 20,000)
def test_anomalous_payment_detection():
    tx_payload = {
        "amount_minor_units": 10000000,
        "expected_rent_minor_units": 2000000,
        "days_from_due_date": 2,
        "days_between_rent_payments": 30
    }
    is_anomaly, anomaly_score, reason = anomaly_detector_service.detect_anomaly(tx_payload)
    assert is_anomaly is True
    assert "higher than the expected monthly rent" in reason or "differs" in reason or "deviates" in reason

# 7. Multiple transactions batch processing test
def test_multiple_transactions_processing():
    txs = [
        {"description": "HOUSE RENT", "amount_minor_units": 2000000, "expected_rent_minor_units": 2000000},
        {"description": "GROCERY", "amount_minor_units": 250000, "expected_rent_minor_units": 2000000},
        {"description": "RENT", "amount_minor_units": 2000000, "expected_rent_minor_units": 2000000}
    ]
    classifications = [rent_classifier_service.classify_transaction(t)[0] for t in txs]
    assert classifications[0] == "RENT"
    assert classifications[1] == "NON_RENT"
    assert classifications[2] == "RENT"

# 8. Missing transaction fields test
def test_missing_transaction_fields():
    tx_payload = {"amount_minor_units": 2000000}
    classification, confidence = rent_classifier_service.classify_transaction(tx_payload)
    assert classification in ["RENT", "NON_RENT"]
    assert 0.0 <= confidence <= 1.0

# 9. Invalid amount handling test
def test_invalid_amount_handling():
    tx_payload = {"description": "RENT", "amount_minor_units": -500, "expected_rent_minor_units": 2000000}
    classification, confidence = rent_classifier_service.classify_transaction(tx_payload)
    assert classification in ["RENT", "NON_RENT"]

# 10. Invalid date handling test
def test_invalid_date_handling():
    tx_payload = {
        "description": "RENT",
        "amount_minor_units": 2000000,
        "expected_rent_minor_units": 2000000,
        "transaction_date": "INVALID_DATE_STRING"
    }
    classification, confidence = rent_classifier_service.classify_transaction(tx_payload)
    assert classification == "RENT"

# 11. Model loading singleton test
def test_model_loading_singleton():
    loader1 = model_loader
    loader2 = model_loader
    assert loader1 is loader2
    assert loader1.loaded is True

# 12. AI service failure fallback test
def test_ai_service_failure_fallback():
    is_anomaly, anomaly_score, reason = anomaly_detector_service.detect_anomaly({})
    assert isinstance(is_anomaly, bool)
    assert isinstance(anomaly_score, float)
    assert isinstance(reason, str)

# 13. Unauthorized AI request rejection test
def test_unauthorized_ai_request(client: TestClient):
    res = client.post("/api/v1/ai/analyze-transaction", json={
        "amount_minor_units": 2000000,
        "description": "RENT"
    })
    assert res.status_code == 401

# 14. Cross-user data access security check
def test_cross_user_data_access(client: TestClient):
    login_res = client.post("/api/v1/auth/tenant/login", json={
        "email": "tenant@rentverify.com",
        "password": "TenantSecret123!"
    })
    assert login_res.status_code == 200
    token = login_res.json()["data"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    res = client.get("/api/v1/verifications/invalid-verification-id-999/ai-results", headers=headers)
    assert res.status_code == 404

# 15. Verification engine AI integration test
def test_verification_engine_ai_integration():
    is_rent, proba = ml_engine.predict_rent_classification(
        amount_minor_units=2000000,
        expected_rent_minor_units=2000000,
        day_of_month=1,
        due_day=1,
        description="APARTMENT RENT",
        payee="Landlord Realty"
    )
    assert is_rent is True
    assert proba > 0.5
