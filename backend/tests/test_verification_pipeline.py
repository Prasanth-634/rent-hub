def test_full_verification_workflow(client):
    # 1. Register & Login Landlord
    reg_res = client.post("/api/v1/auth/landlord/register", json={
        "email": "pipeline_landlord@example.com",
        "password": "SecurePassword123!",
        "full_name": "Pipeline Landlord",
        "organization_name": "Pipeline Org"
    })
    assert reg_res.status_code == 200

    login_res = client.post("/api/v1/auth/landlord/login", json={
        "email": "pipeline_landlord@example.com",
        "password": "SecurePassword123!"
    })
    assert login_res.status_code == 200
    token = login_res.json()["data"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Create Tenant
    tenant_res = client.post("/api/v1/tenants", json={
        "full_name": "John Doe Tenant",
        "email": "john.doe@example.com",
        "phone": "+919876543210"
    }, headers=headers)
    assert tenant_res.status_code == 200
    tenant_id = tenant_res.json()["id"]

    # 3. Create Property
    prop_res = client.post("/api/v1/properties", json={
        "address_line1": "Flat 402, Sunshine Heights",
        "city": "Mumbai",
        "state": "Maharashtra",
        "postal_code": "400001",
        "country": "IN"
    }, headers=headers)
    assert prop_res.status_code == 200
    prop_id = prop_res.json()["id"]

    # 4. Create Lease
    lease_res = client.post("/api/v1/leases", json={
        "property_id": prop_id,
        "tenant_id": tenant_id,
        "monthly_rent_minor_units": 2500000,  # ₹25,000
        "currency": "INR",
        "due_day": 5,
        "start_date": "2026-01-01T00:00:00",
        "end_date": "2026-12-31T00:00:00"
    }, headers=headers)
    assert lease_res.status_code == 200
    lease_id = lease_res.json()["id"]

    # 5. Create Verification Request
    verif_res = client.post("/api/v1/verifications", json={
        "tenant_id": tenant_id,
        "lease_id": lease_id,
        "period_start": "2026-01-01T00:00:00",
        "period_end": "2026-03-31T00:00:00"
    }, headers=headers)
    assert verif_res.status_code == 200
    verif_data = verif_res.json()
    verif_id = verif_data["id"]
    consent_id = verif_data["consents"][0]["id"]

    # 6. Approve Tenant Consent
    approve_res = client.post(f"/api/v1/consents/{consent_id}/approve", headers=headers)
    assert approve_res.status_code == 200
    assert approve_res.json()["status"] == "APPROVED"

    # 7. Upload Bank CSV
    csv_content = (
        "Date,Description,Amount,Payer,Payee\n"
        "2026-01-03,RENT FOR JAN 2026,25000.00,John Doe,Sunshine Landlord\n"
        "2026-02-04,FEBRUARY MONTHLY RENT,25000.00,John Doe,Sunshine Landlord\n"
        "2026-03-05,RENT PAYMENT MARCH,25000.00,John Doe,Sunshine Landlord\n"
    ).encode("utf-8")

    upload_res = client.post(
        f"/api/v1/verifications/{verif_id}/transactions/upload",
        files={"file": ("bank_statement.csv", csv_content, "text/csv")},
        headers=headers
    )
    assert upload_res.status_code == 200
    txs = upload_res.json()
    assert len(txs) == 3

    # 8. Execute Verification Engine
    process_res = client.post(f"/api/v1/verifications/{verif_id}/process", headers=headers)
    assert process_res.status_code == 200
    result = process_res.json()
    assert result["months_expected"] == 3
    assert result["on_time_count"] == 3
    assert result["status"] == "VERIFIED"

    # 9. Get Report JSON
    report_res = client.get(f"/api/v1/reports/{verif_id}", headers=headers)
    assert report_res.status_code == 200
    report = report_res.json()
    assert report["status"] == "VERIFIED"
    assert report["verification_summary"]["on_time_count"] == 3
