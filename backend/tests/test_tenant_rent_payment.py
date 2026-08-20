import pytest

@pytest.fixture
def tenant_token(client):
    # Register/login tenant
    email = "tenant_pay_test@example.com"
    pwd = "TenantSecret123!"
    client.post("/api/v1/auth/tenant/register", json={
        "email": email,
        "password": pwd,
        "full_name": "Alex Johnson"
    })
    res = client.post("/api/v1/auth/tenant/login", json={"email": email, "password": pwd})
    assert res.status_code == 200
    return res.json()["data"]["access_token"]

@pytest.fixture
def landlord_token(client):
    email = "landlord_pay_iso@example.com"
    pwd = "LandlordSecret123!"
    client.post("/api/v1/auth/landlord/register", json={
        "email": email,
        "password": pwd,
        "full_name": "Landlord Iso",
        "company_name": "Landlord Org"
    })
    res = client.post("/api/v1/auth/landlord/login", json={"email": email, "password": pwd})
    assert res.status_code == 200
    return res.json()["data"]["access_token"]


def test_get_current_rent_due(client, tenant_token):
    res = client.get(
        "/api/v1/tenant/rent-payment/current",
        headers={"Authorization": f"Bearer {tenant_token}"}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["monthly_rent"] > 0
    assert len(data["property_name"]) > 0
    assert data["payment_status"] in ["PAYMENT DUE", "PAID"]


def test_create_and_complete_rent_payment(client, tenant_token):
    # 1. Create order
    res = client.post(
        "/api/v1/tenant/rent-payment/create-order",
        json={"payment_method": "UPI"},
        headers={"Authorization": f"Bearer {tenant_token}"}
    )
    assert res.status_code == 200
    order_data = res.json()
    assert "order_id" in order_data
    payment_id = order_data["payment_id"]

    # 2. Complete payment
    res_comp = client.post(
        f"/api/v1/tenant/rent-payment/{payment_id}/complete",
        headers={"Authorization": f"Bearer {tenant_token}"}
    )
    assert res_comp.status_code == 200
    comp_data = res_comp.json()
    assert comp_data["status"] in ["PAID", "LATE"]
    assert comp_data["receipt_id"].startswith("RCP-2026-")

    # 3. Verify duplicate payment prevention for September 2026
    res_dup = client.post(
        "/api/v1/tenant/rent-payment/create-order",
        json={"payment_method": "UPI"},
        headers={"Authorization": f"Bearer {tenant_token}"}
    )
    assert res_dup.status_code == 400
    assert "already paid" in res_dup.json()["detail"].lower()


def test_get_rent_payments_and_receipt(client, tenant_token):
    # List payments
    res = client.get(
        "/api/v1/tenant/rent-payments",
        headers={"Authorization": f"Bearer {tenant_token}"}
    )
    assert res.status_code == 200
    items = res.json()
    assert len(items) >= 1

    # Receipt retrieval
    receipt_res = client.get(
        f"/api/v1/tenant/rent-payments/pmt_jul_001/receipt",
        headers={"Authorization": f"Bearer {tenant_token}"}
    )
    assert receipt_res.status_code == 200
    rcp = receipt_res.json()
    assert rcp["title"] == "RENT PAYMENT RECEIPT"
    assert rcp["receipt_id"] == "RCP-2026-JUL01"


def test_landlord_cannot_access_tenant_rent_payment(client, landlord_token):
    res = client.get(
        "/api/v1/tenant/rent-payment/current",
        headers={"Authorization": f"Bearer {landlord_token}"}
    )
    assert res.status_code == 403
