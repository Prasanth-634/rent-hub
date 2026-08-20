import pytest
import json
from fastapi.testclient import TestClient
from app.db.models import Organization, Payment, WebhookEvent, CreditTransaction

def get_landlord_token(client: TestClient) -> str:
    res = client.post("/api/v1/auth/landlord/login", json={
        "email": "landlord@rentverify.com",
        "password": "LandlordSecret123!"
    })
    assert res.status_code == 200
    return res.json()["data"]["access_token"]

# 1. Billing Page Load Test
def test_get_landlord_billing_summary(client: TestClient):
    token = get_landlord_token(client)
    headers = {"Authorization": f"Bearer {token}"}
    res = client.get("/api/v1/landlord/billing", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert "current_plan" in data
    assert "credit_summary" in data
    assert "credit_usage" in data
    assert "api_access" in data
    assert "payment_history" in data
    assert "credit_activity" in data
    assert data["credit_summary"]["rule"] == "1 Verification = 1 Credit"

# 2. Credit Balance Query Test
def test_get_landlord_credits(client: TestClient):
    token = get_landlord_token(client)
    headers = {"Authorization": f"Bearer {token}"}
    res = client.get("/api/v1/landlord/credits", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert "available_credits" in data
    assert data["available_credits"] >= 0

# 3. Credit Packages Order Creation Test
def test_create_credit_order(client: TestClient):
    token = get_landlord_token(client)
    headers = {"Authorization": f"Bearer {token}"}
    res = client.post("/api/v1/landlord/billing/create-order", json={
        "credit_package_id": "5000"
    }, headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert "order_id" in data
    assert "payment_id" in data
    assert data["credits_to_add"] == 5000
    assert data["amount"] == 99.0

# 4. Payment Verification & Credit Addition Test
def test_payment_verification_and_credit_addition(client: TestClient):
    token = get_landlord_token(client)
    headers = {"Authorization": f"Bearer {token}"}
    
    # Create order first
    order_res = client.post("/api/v1/landlord/billing/create-order", json={"credit_package_id": "1000"}, headers=headers)
    payment_id = order_res.json()["payment_id"]

    # Verify payment / simulate success
    verify_res = client.post("/api/v1/landlord/billing/verify-payment", json={"payment_id": payment_id}, headers=headers)
    assert verify_res.status_code == 200
    assert verify_res.json()["status"] == "PAID"
    assert verify_res.json()["credits_added"] == 1000

# 5. Idempotency Test: Webhook Sent Twice Must Add Credits Exactly ONCE
def test_webhook_idempotency(client: TestClient, db):
    token = get_landlord_token(client)
    headers = {"Authorization": f"Bearer {token}"}
    
    # Create order
    order_res = client.post("/api/v1/landlord/billing/create-order", json={"credit_package_id": "1000"}, headers=headers)
    payment_id = order_res.json()["payment_id"]
    order_id = order_res.json()["order_id"]

    # Get initial balance
    billing_before = client.get("/api/v1/landlord/billing", headers=headers).json()
    bal_before = billing_before["credit_summary"]["available_credits"]

    webhook_payload = {
        "event_id": f"evt_idempotency_test_{order_id}",
        "event": "payment.captured",
        "payload": {
            "payment": {
                "entity": {
                    "id": payment_id,
                    "order_id": order_id,
                    "amount": 2900,
                    "currency": "INR",
                    "status": "captured"
                }
            }
        }
    }
    raw_body = json.dumps(webhook_payload).encode("utf-8")

    # Send webhook 1st time
    res1 = client.post("/api/v1/billing/webhooks/razorpay", data=raw_body, headers={"X-Razorpay-Signature": "dev_simulated_signature", "Content-Type": "application/json"})
    assert res1.status_code == 200

    # Send SAME webhook 2nd time (Duplicate)
    res2 = client.post("/api/v1/billing/webhooks/razorpay", data=raw_body, headers={"X-Razorpay-Signature": "dev_simulated_signature", "Content-Type": "application/json"})
    assert res2.status_code == 200
    assert res2.json()["status"] == "already_processed"

    # Verify balance increased by EXACTLY 1,000 credits (not 2,000!)
    billing_after = client.get("/api/v1/landlord/billing", headers=headers).json()
    bal_after = billing_after["credit_summary"]["available_credits"]
    assert bal_after == bal_before + 1000

# 6. Credit Transaction History Test
def test_credit_transaction_history(client: TestClient):
    token = get_landlord_token(client)
    headers = {"Authorization": f"Bearer {token}"}
    res = client.get("/api/v1/landlord/credit-transactions", headers=headers)
    assert res.status_code == 200
    assert isinstance(res.json(), list)

# 7. Payment History Test
def test_payment_history(client: TestClient):
    token = get_landlord_token(client)
    headers = {"Authorization": f"Bearer {token}"}
    res = client.get("/api/v1/landlord/payment-history", headers=headers)
    assert res.status_code == 200
    assert isinstance(res.json(), list)

# 8. Security Isolation Test: Tenant / Unauthorized User Cannot Access Landlord Billing
def test_security_isolation_landlord_billing(client: TestClient):
    tenant_login = client.post("/api/v1/auth/tenant/login", json={
        "email": "tenant@rentverify.com",
        "password": "TenantSecret123!"
    })
    token = tenant_login.json()["data"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    res = client.get("/api/v1/landlord/billing", headers=headers)
    assert res.status_code == 403
