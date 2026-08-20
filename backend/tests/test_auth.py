import pytest

def test_health_check(client):
    res = client.get("/api/v1/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"


def test_individual_role_logins(client):
    # 1. Landlord Login
    res_landlord = client.post("/api/v1/auth/landlord/login", json={
        "email": "landlord@rentverify.com",
        "password": "LandlordSecret123!"
    })
    assert res_landlord.status_code == 200
    data_l = res_landlord.json()
    assert data_l["success"] is True
    assert data_l["data"]["user"]["role"] == "LANDLORD"
    token_l = data_l["data"]["access_token"]

    # 2. Lender Login
    res_lender = client.post("/api/v1/auth/lender/login", json={
        "email": "lender@rentverify.com",
        "password": "LenderSecret123!"
    })
    assert res_lender.status_code == 200
    data_len = res_lender.json()
    assert data_len["success"] is True
    assert data_len["data"]["user"]["role"] == "LENDER"

    # 3. Tenant Login
    res_tenant = client.post("/api/v1/auth/tenant/login", json={
        "email": "tenant@rentverify.com",
        "password": "TenantSecret123!"
    })
    assert res_tenant.status_code == 200
    data_t = res_tenant.json()
    assert data_t["success"] is True
    assert data_t["data"]["user"]["role"] == "TENANT"

    # 4. Admin Login
    res_admin = client.post("/api/v1/auth/admin/login", json={
        "email": "admin@rentverify.com",
        "password": "AdminSecret123!",
        "two_factor_code": "849201"
    })
    assert res_admin.status_code == 200
    data_a = res_admin.json()
    assert data_a["success"] is True
    assert data_a["data"]["user"]["role"] == "ADMIN"


def test_role_mismatch_rejection(client):
    # Tenant credentials sent to Landlord login endpoint should return 401
    res = client.post("/api/v1/auth/landlord/login", json={
        "email": "tenant@rentverify.com",
        "password": "TenantSecret123!"
    })
    assert res.status_code == 401
    assert res.json()["detail"]["error_code"] == "INVALID_CREDENTIALS"


def test_logout_token_invalidation(client):
    # Login as landlord
    login_res = client.post("/api/v1/auth/landlord/login", json={
        "email": "landlord@rentverify.com",
        "password": "LandlordSecret123!"
    })
    token = login_res.json()["data"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Verify access to /me works
    me_res = client.get("/api/v1/auth/me", headers=headers)
    assert me_res.status_code == 200

    # Logout
    logout_res = client.post("/api/v1/auth/logout", headers=headers)
    assert logout_res.status_code == 200

    # Token should now be invalidated
    me_res_after = client.get("/api/v1/auth/me", headers=headers)
    assert me_res_after.status_code == 401


def test_google_login_success_and_account_linking(client):
    import json
    token_data = json.dumps({
        "sub": "firebase-uid-landlord-999",
        "email": "landlord@rentverify.com",
        "name": "Apex Landlord"
    })
    res = client.post("/api/v1/auth/landlord/google", json={"id_token": token_data})
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["data"]["user"]["role"] == "LANDLORD"
    assert data["data"]["user"]["email"] == "landlord@rentverify.com"


def test_google_login_unlinked_account_404(client):
    import json
    token_data = json.dumps({
        "sub": "firebase-uid-unknown-888",
        "email": "unknown.person@example.com",
        "name": "Unknown User"
    })
    res = client.post("/api/v1/auth/landlord/google", json={"id_token": token_data})
    assert res.status_code == 404
    data = res.json()
    assert data["detail"]["message"] == "This Google account is not linked to a RentVerify account."
    assert data["detail"]["error_code"] == "ACCOUNT_NOT_LINKED"


def test_google_login_role_mismatch_403(client):
    import json
    # Tenant Google account attempting Landlord Google portal
    token_data = json.dumps({
        "sub": "firebase-uid-tenant-777",
        "email": "tenant@rentverify.com",
        "name": "Alex Johnson"
    })
    res = client.post("/api/v1/auth/landlord/google", json={"id_token": token_data})
    assert res.status_code == 403
    data = res.json()
    assert data["detail"]["message"] == "This account does not have access to this portal."
    assert data["detail"]["error_code"] == "ROLE_MISMATCH"


def test_google_login_all_roles(client):
    import json
    for role, endpoint, email in [
        ("LANDLORD", "landlord", "landlord@rentverify.com"),
        ("TENANT", "tenant", "tenant@rentverify.com"),
        ("LENDER", "lender", "lender@rentverify.com"),
        ("ADMIN", "admin", "admin@rentverify.com"),
    ]:
        token_data = json.dumps({
            "sub": f"firebase-uid-{endpoint}-123",
            "email": email,
            "name": f"{role} User"
        })
        res = client.post(f"/api/v1/auth/{endpoint}/google", json={"id_token": token_data})
        assert res.status_code == 200
        data = res.json()
        assert data["success"] is True
        assert data["data"]["user"]["role"] == role
