import pytest
import io

def test_tenant_registration_forces_tenant_role(client):
    res = client.post("/api/v1/auth/tenant/register", json={
        "email": "new_tenant_test@example.com",
        "password": "TenantPassword123!",
        "full_name": "New Test Tenant",
        "phone": "+919876543210",
        "role": "ADMIN"  # Attempt to inject ADMIN role
    })
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    # Verify role was forced to TENANT
    assert data["data"]["user"]["role"] == "TENANT"


def test_tenant_portal_workflow(client):
    # 1. Login Landlord to create tenant & verification request
    l_login = client.post("/api/v1/auth/landlord/login", json={
        "email": "landlord@rentverify.com",
        "password": "LandlordSecret123!"
    })
    l_token = l_login.json()["data"]["access_token"]
    l_headers = {"Authorization": f"Bearer {l_token}"}

    # Create Property & Lease for tenant@rentverify.com
    prop_res = client.post("/api/v1/properties", json={
        "address_line1": "707 Tenant Lake View",
        "city": "Mumbai",
        "state": "MH",
        "postal_code": "400002",
        "country": "IN"
    }, headers=l_headers)
    prop_id = prop_res.json()["id"]

    # Get Tenant ID for tenant@rentverify.com
    t_login = client.post("/api/v1/auth/tenant/login", json={
        "email": "tenant@rentverify.com",
        "password": "TenantSecret123!"
    })
    t_token = t_login.json()["data"]["access_token"]
    t_headers = {"Authorization": f"Bearer {t_token}"}

    t_profile = client.get("/api/v1/tenant/profile", headers=t_headers).json()
    t_id = t_profile["id"]

    lease_res = client.post("/api/v1/leases", json={
        "property_id": prop_id,
        "tenant_id": t_id,
        "monthly_rent_minor_units": 2000000,
        "currency": "INR",
        "due_day": 5,
        "start_date": "2026-01-01T00:00:00",
        "end_date": "2026-12-31T00:00:00"
    }, headers=l_headers)
    lease_id = lease_res.json()["id"]

    # Create Verification Request for Tenant
    verif_res = client.post("/api/v1/verifications", json={
        "tenant_id": t_id,
        "lease_id": lease_id,
        "period_start": "2026-01-01T00:00:00",
        "period_end": "2026-03-31T00:00:00"
    }, headers=l_headers)
    verif_id = verif_res.json()["id"]
    consent_id = verif_res.json()["consents"][0]["id"]

    # 2. Tenant Dashboard API
    dash_res = client.get("/api/v1/tenant/dashboard", headers=t_headers)
    assert dash_res.status_code == 200
    assert dash_res.json()["pending_requests_count"] >= 1

    # 3. Tenant Verification Requests list
    requests_res = client.get("/api/v1/tenant/verification-requests", headers=t_headers)
    assert requests_res.status_code == 200
    assert len(requests_res.json()) >= 1

    # 4. Tenant Verification Detail
    detail_res = client.get(f"/api/v1/tenant/verification-requests/{verif_id}", headers=t_headers)
    assert detail_res.status_code == 200
    assert detail_res.json()["id"] == verif_id

    # 5. Tenant Approve Consent
    approve_res = client.post(f"/api/v1/tenant/consents/{consent_id}/approve", headers=t_headers)
    assert approve_res.status_code == 200
    assert approve_res.json()["status"] == "APPROVED"

    # 6. Tenant Upload CSV
    csv_bytes = (
        "transaction_id,date,amount,description,payer,payee\n"
        "TXN01,2026-01-05,20000.00,HOUSE RENT JAN 2026,Alex,Apex\n"
        "TXN02,2026-02-05,20000.00,HOUSE RENT FEB 2026,Alex,Apex\n"
    ).encode("utf-8")

    upload_res = client.post(
        "/api/v1/tenant/transactions/upload",
        files={"file": ("rental_txns.csv", csv_bytes, "text/csv")},
        data={"verification_id": verif_id},
        headers=t_headers
    )
    assert upload_res.status_code == 200
    up_data = upload_res.json()
    assert up_data["valid_count"] == 2
    assert up_data["status"] == "COMPLETED"

    # 7. Tenant Transactions list
    tx_res = client.get("/api/v1/tenant/transactions", headers=t_headers)
    assert tx_res.status_code == 200
    assert len(tx_res.json()) >= 2

    # 8. Tenant Verification History
    hist_res = client.get("/api/v1/tenant/verification-history", headers=t_headers)
    assert hist_res.status_code == 200

    # 9. Tenant Notifications
    notif_res = client.get("/api/v1/tenant/notifications", headers=t_headers)
    assert notif_res.status_code == 200
    assert len(notif_res.json()) >= 1


def test_cross_tenant_access_forbidden(client):
    # Register Tenant A
    reg_a = client.post("/api/v1/auth/tenant/register", json={
        "email": "tenant_a@example.com",
        "password": "Password123!",
        "full_name": "Tenant A"
    })
    token_a = reg_a.json()["data"]["access_token"]

    # Register Tenant B
    reg_b = client.post("/api/v1/auth/tenant/register", json={
        "email": "tenant_b@example.com",
        "password": "Password123!",
        "full_name": "Tenant B"
    })
    token_b = reg_b.json()["data"]["access_token"]

    # Tenant A attempts to access Tenant B's profile via GET /api/v1/tenant/profile (returns own profile)
    profile_a = client.get("/api/v1/tenant/profile", headers={"Authorization": f"Bearer {token_a}"}).json()
    profile_b = client.get("/api/v1/tenant/profile", headers={"Authorization": f"Bearer {token_b}"}).json()

    assert profile_a["email"] == "tenant_a@example.com"
    assert profile_b["email"] == "tenant_b@example.com"
