import pytest


def test_lender_registration_forces_lender_role(client):
    res = client.post("/api/v1/auth/lender/register", json={
        "email": "testlender_reg@example.com",
        "password": "LenderPassword123!",
        "full_name": "Lender Reg User",
        "organization_name": "Apex Capital"
    })
    assert res.status_code == 200
    data = res.json()["data"]
    assert data["user"]["role"] == "LENDER"
    assert data["access_token"] is not None


def test_lender_portal_workflow(client):
    # 1. Register Lender
    reg = client.post("/api/v1/auth/lender/register", json={
        "email": "lender_wf@example.com",
        "password": "Password123!",
        "full_name": "Lender Workflow User",
        "organization_name": "Horizon Finance"
    })
    token = reg.json()["data"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Get Dashboard
    dash_res = client.get("/api/v1/lender/dashboard", headers=headers)
    assert dash_res.status_code == 200
    dash_data = dash_res.json()
    assert "total_verification_requests" in dash_data
    assert "verified" in dash_data

    # 3. Create Verification Request
    create_req = client.post("/api/v1/lender/verification-requests", json={
        "tenant_full_name": "Amit Patel",
        "tenant_email": "amit.patel@example.com",
        "tenant_phone": "+91 91234 56789",
        "period_start": "2026-01-01",
        "period_end": "2026-12-31",
        "purpose": "Loan Application",
        "reference_id": "LOAN-8891"
    }, headers=headers)
    assert create_req.status_code == 201
    v_data = create_req.json()
    assert v_data["id"] is not None
    assert v_data["consent_status"] == "PENDING"
    assert v_data["verification_status"] == "PENDING_CONSENT"
    req_id = v_data["id"]

    # 4. Get Verification Requests List
    list_res = client.get("/api/v1/lender/verification-requests", headers=headers)
    assert list_res.status_code == 200
    assert len(list_res.json()) >= 1

    # 5. Get Verification Detail (Consent PENDING -> payment_summary must be null or default)
    detail_res = client.get(f"/api/v1/lender/verification-requests/{req_id}", headers=headers)
    assert detail_res.status_code == 200
    detail_data = detail_res.json()
    assert detail_data["consent_status"] == "PENDING"
    assert detail_data["payment_summary"] is None  # Unconsented guard verified!

    # 6. Reports
    reports_res = client.get("/api/v1/lender/reports", headers=headers)
    assert reports_res.status_code == 200
    assert len(reports_res.json()) >= 1

    # 7. API Keys
    key_create = client.post("/api/v1/lender/api-keys", json={"name": "Test Key"}, headers=headers)
    assert key_create.status_code == 201
    key_data = key_create.json()
    assert "raw_api_key_secret" in key_data
    assert key_data["raw_api_key_secret"].startswith("rv_live_")
    key_id = key_data["id"]

    # Rotate API Key
    rotate_res = client.post(f"/api/v1/lender/api-keys/{key_id}/rotate", headers=headers)
    assert rotate_res.status_code == 200
    assert rotate_res.json()["raw_api_key_secret"] is not None

    # Revoke API Key
    revoke_res = client.delete(f"/api/v1/lender/api-keys/{key_id}", headers=headers)
    assert revoke_res.status_code == 200

    # 8. Billing
    billing_res = client.get("/api/v1/lender/billing", headers=headers)
    assert billing_res.status_code == 200
    assert "verification_credits" in billing_res.json()

    # 9. Profile
    profile_res = client.get("/api/v1/lender/profile", headers=headers)
    assert profile_res.status_code == 200
    assert profile_res.json()["email"] == "lender_wf@example.com"

    update_prof = client.patch("/api/v1/lender/profile", json={"full_name": "Lender Workflow Updated"}, headers=headers)
    assert update_prof.status_code == 200
    assert update_prof.json()["full_name"] == "Lender Workflow Updated"


def test_cross_lender_access_forbidden(client):
    # Lender A
    reg_a = client.post("/api/v1/auth/lender/register", json={
        "email": "lender_iso_a@example.com",
        "password": "Password123!",
        "full_name": "Lender A",
        "organization_name": "Org Lender A"
    })
    token_a = reg_a.json()["data"]["access_token"]

    # Lender B
    reg_b = client.post("/api/v1/auth/lender/register", json={
        "email": "lender_iso_b@example.com",
        "password": "Password123!",
        "full_name": "Lender B",
        "organization_name": "Org Lender B"
    })
    token_b = reg_b.json()["data"]["access_token"]

    # Lender A creates verification request
    create_req = client.post("/api/v1/lender/verification-requests", json={
        "tenant_full_name": "Isolation Tenant",
        "tenant_email": "tenant_iso@example.com",
        "period_start": "2026-01-01",
        "period_end": "2026-12-31",
        "purpose": "Credit Check"
    }, headers={"Authorization": f"Bearer {token_a}"})
    req_id = create_req.json()["id"]

    # Lender B attempts to access Lender A's request -> 403 Forbidden
    get_res = client.get(f"/api/v1/lender/verification-requests/{req_id}", headers={"Authorization": f"Bearer {token_b}"})
    assert get_res.status_code == 403


def test_lender_cannot_access_landlord_routes(client):
    reg = client.post("/api/v1/auth/lender/register", json={
        "email": "lender_landlord_check@example.com",
        "password": "Password123!",
        "full_name": "Lender Check User",
        "organization_name": "Lender Bank"
    })
    token = reg.json()["data"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Lender attempts to access landlord properties -> 403 Forbidden
    res = client.get("/api/v1/landlord/properties", headers=headers)
    assert res.status_code == 403
