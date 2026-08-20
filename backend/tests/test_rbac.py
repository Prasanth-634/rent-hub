import pytest

def test_admin_route_forbidden_for_landlord_and_tenant(client):
    # 1. Login as Landlord
    landlord_login = client.post("/api/v1/auth/landlord/login", json={
        "email": "landlord@rentverify.com",
        "password": "LandlordSecret123!"
    })
    landlord_token = landlord_login.json()["data"]["access_token"]
    
    res = client.get("/api/v1/admin/users", headers={"Authorization": f"Bearer {landlord_token}"})
    assert res.status_code == 403
    assert "not permitted" in res.json()["detail"]

    # 2. Login as Tenant
    tenant_login = client.post("/api/v1/auth/tenant/login", json={
        "email": "tenant@rentverify.com",
        "password": "TenantSecret123!"
    })
    tenant_token = tenant_login.json()["data"]["access_token"]

    res_t = client.get("/api/v1/admin/users", headers={"Authorization": f"Bearer {tenant_token}"})
    assert res_t.status_code == 403
    assert "not permitted" in res_t.json()["detail"]


def test_tenant_cannot_create_property(client):
    tenant_login = client.post("/api/v1/auth/tenant/login", json={
        "email": "tenant@rentverify.com",
        "password": "TenantSecret123!"
    })
    tenant_token = tenant_login.json()["data"]["access_token"]

    res = client.post("/api/v1/properties", json={
        "address_line1": "Forbidden Street 123",
        "city": "Mumbai",
        "state": "MH",
        "postal_code": "400001",
        "country": "IN"
    }, headers={"Authorization": f"Bearer {tenant_token}"})

    assert res.status_code == 403
    assert "not permitted" in res.json()["detail"]


def test_cross_landlord_property_access_forbidden(client):
    # Register Landlord A
    reg_a = client.post("/api/v1/auth/landlord/register", json={
        "email": "landlord_rbac_a@example.com",
        "password": "Password123!",
        "full_name": "Landlord A",
        "organization_name": "Org A"
    })
    token_a = reg_a.json()["data"]["access_token"]

    # Register Landlord B
    reg_b = client.post("/api/v1/auth/landlord/register", json={
        "email": "landlord_rbac_b@example.com",
        "password": "Password123!",
        "full_name": "Landlord B",
        "organization_name": "Org B"
    })
    token_b = reg_b.json()["data"]["access_token"]

    # Landlord A creates a property
    prop_res = client.post("/api/v1/properties", json={
        "address_line1": "101 Landlord A Villa",
        "city": "Bengaluru",
        "state": "Karnataka",
        "postal_code": "560001",
        "country": "IN"
    }, headers={"Authorization": f"Bearer {token_a}"})
    prop_id = prop_res.json()["id"]

    # Landlord B attempts to view Landlord A's property -> 403 Forbidden
    get_res = client.get(f"/api/v1/properties/{prop_id}", headers={"Authorization": f"Bearer {token_b}"})
    assert get_res.status_code == 403
    assert "Forbidden" in get_res.json()["detail"]


def test_admin_has_full_access_to_admin_and_properties(client):
    admin_login = client.post("/api/v1/auth/admin/login", json={
        "email": "admin@rentverify.com",
        "password": "AdminSecret123!",
        "two_factor_code": "849201"
    })
    admin_token = admin_login.json()["data"]["access_token"]

    # Admin lists all users
    users_res = client.get("/api/v1/admin/users", headers={"Authorization": f"Bearer {admin_token}"})
    assert users_res.status_code == 200
    assert len(users_res.json()) >= 4
