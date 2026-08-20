# API Specification

Base: /api/v1

Auth:
POST /auth/register
POST /auth/login
POST /auth/refresh
POST /auth/logout
GET /auth/me

Tenants:
POST /tenants
GET /tenants/{id}
PATCH /tenants/{id}

Properties:
POST /properties
GET /properties
GET /properties/{id}
PATCH /properties/{id}

Leases:
POST /leases
GET /leases/{id}
PATCH /leases/{id}

Verification:
POST /verifications
GET /verifications/{id}
POST /verifications/{id}/process
GET /verifications/{id}/result

Consent:
POST /consents
POST /consents/{id}/approve
POST /consents/{id}/reject
POST /consents/{id}/revoke

Transactions:
POST /verifications/{id}/transactions/upload
GET /verifications/{id}/transactions

AI:
POST /ai/classify-transaction
POST /ai/detect-anomaly

Reports:
GET /reports/{verification_id}
GET /reports/{verification_id}/download

Billing:
GET /plans
POST /billing/checkout
GET /billing/subscription
POST /billing/webhooks/razorpay

API Keys:
POST /api-keys
GET /api-keys
POST /api-keys/{id}/rotate
POST /api-keys/{id}/revoke

Admin:
GET /admin/users
GET /admin/subscriptions
GET /admin/payments
GET /admin/verifications
GET /admin/audit-logs

Health:
GET /health
GET /ready

Standard error:
{"error":{"code":"CODE","message":"Human readable","request_id":"uuid"}}
