import pytest

def test_landlord_registration_forces_landlord_role(client):
    res = client.post("/api/v1/auth/landlord/register", json={
        "email": "new_landlord_test@example.com",
        "password": "LandlordPassword123!",
        "full_name": "New Test Landlord",
        "organization_name": "Apex Realty Test",
        "phone": "+919876543210",
        "role": "ADMIN"  # Attempt role escalation
    })
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    # Role forced to LANDLORD on backend
    assert data["data"]["user"]["role"] == "LANDLORD"


def test_landlord_portal_workflow(client):
    # 1. Login Landlord
    login_res = client.post("/api/v1/auth/landlord/login", json={
        "email": "landlord@rentverify.com",
        "password": "LandlordSecret123!"
    })
    assert login_res.status_code == 200
    token = login_res.json()["data"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Get Landlord Dashboard
    dash_res = client.get("/api/v1/landlord/dashboard", headers=headers)
    assert dash_res.status_code == 200
    assert "total_properties" in dash_res.json()

    # 3. Create Property
    prop_res = client.post("/api/v1/landlord/properties", json={
        "name": "Emerald Heights Villa",
        "property_type": "APARTMENT",
        "address_line1": "Flat 801, Emerald Towers",
        "city": "Mumbai",
        "state": "Maharashtra",
        "postal_code": "400005",
        "number_of_units": 10
    }, headers=headers)
    assert prop_res.status_code == 200
    prop_id = prop_res.json()["id"]

    # 4. List Properties
    props_list = client.get("/api/v1/landlord/properties", headers=headers)
    assert props_list.status_code == 200
    assert len(props_list.json()) >= 1

    # 5. Create Tenant & Lease
    tenant_res = client.post("/api/v1/landlord/tenants", json={
        "full_name": "Landlord Test Tenant",
        "email": "ll_tenant_test@example.com",
        "phone": "+919876543211",
        "property_id": prop_id,
        "unit_number": "Flat 801",
        "lease_start_date": "2026-01-01",
        "lease_end_date": "2026-12-31",
        "monthly_rent_minor_units": 3000000
    }, headers=headers)
    assert tenant_res.status_code == 200
    tenant_id = tenant_res.json()["id"]
    lease_id = tenant_res.json()["lease_id"]

    # 6. Create Lease with invalid dates (end before start) -> 400 Bad Request
    invalid_lease_res = client.post("/api/v1/landlord/leases", json={
        "tenant_id": tenant_id,
        "property_id": prop_id,
        "monthly_rent_minor_units": 3000000,
        "due_day": 5,
        "payment_frequency": "MONTHLY",
        "start_date": "2026-12-31",
        "end_date": "2026-01-01"
    }, headers=headers)
    assert invalid_lease_res.status_code == 400

    # 7. Create Verification Request
    verif_res = client.post("/api/v1/landlord/verifications", json={
        "tenant_id": tenant_id,
        "property_id": prop_id,
        "lease_id": lease_id,
        "period_start": "2026-01-01",
        "period_end": "2026-03-31",
        "purpose": "Verification for mortgage approval."
    }, headers=headers)
    assert verif_res.status_code == 200
    verif_id = verif_res.json()["id"]

    # 8. Get Verification Detail
    detail_res = client.get(f"/api/v1/landlord/verifications/{verif_id}", headers=headers)
    assert detail_res.status_code == 200
    assert detail_res.json()["id"] == verif_id

    # 9. API Key Generation (Raw Secret single exposure)
    key_res = client.post("/api/v1/landlord/api-keys", json={"name": "Test Key"}, headers=headers)
    assert key_res.status_code == 200
    assert "raw_api_key_secret" in key_res.json()

    # 10. Billing API
    bill_res = client.get("/api/v1/landlord/billing", headers=headers)
    assert bill_res.status_code == 200

    # 11. Profile API
    profile_res = client.get("/api/v1/landlord/profile", headers=headers)
    assert profile_res.status_code == 200


def test_cross_landlord_access_forbidden(client):
    # Register Landlord A
    reg_a = client.post("/api/v1/auth/landlord/register", json={
        "email": "landlord_a@example.com",
        "password": "Password123!",
        "full_name": "Landlord A",
        "organization_name": "Org A"
    })
    token_a = reg_a.json()["data"]["access_token"]
    headers_a = {"Authorization": f"Bearer {token_a}"}

    # Register Landlord B
    reg_b = client.post("/api/v1/auth/landlord/register", json={
        "email": "landlord_b@example.com",
        "password": "Password123!",
        "full_name": "Landlord B",
        "organization_name": "Org B"
    })
    token_b = reg_b.json()["data"]["access_token"]
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # Landlord A creates a property
    prop_a = client.post("/api/v1/landlord/properties", json={
        "name": "Landlord A Property",
        "property_type": "APARTMENT",
        "address_line1": "101 A Street",
        "city": "Mumbai",
        "state": "MH",
        "postal_code": "400001"
    }, headers=headers_a).json()

    # Landlord B attempts to access Landlord A's property -> 403 Forbidden
    forbidden_res = client.get(f"/api/v1/landlord/properties/{prop_a['id']}", headers=headers_b)
    assert forbidden_res.status_code == 403
