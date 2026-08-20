import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text, JSON
)
from sqlalchemy.orm import relationship
from app.core.database import Base


def generate_uuid():
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(String, nullable=False, default="TENANT")  # TENANT, LANDLORD, LENDER, ADMIN
    firebase_uid = Column(String, unique=True, index=True, nullable=True)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=True)
    token_version = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    organization_memberships = relationship("OrganizationUser", back_populates="user")
    tenant_profile = relationship("Tenant", back_populates="user", uselist=False)


class Organization(Base):
    __tablename__ = "organizations"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False, default="LANDLORD")  # LANDLORD, LENDER, TENANT
    owner_user_id = Column(String, ForeignKey("users.id"), nullable=True)
    verification_credits = Column(Integer, default=5000)
    created_at = Column(DateTime, default=datetime.utcnow)

    members = relationship("OrganizationUser", back_populates="organization")
    subscriptions = relationship("Subscription", back_populates="organization")
    payments = relationship("Payment", back_populates="organization")
    api_keys = relationship("APIKey", back_populates="organization")
    properties = relationship("Property", back_populates="organization")
    verifications = relationship("VerificationRequest", back_populates="requester_organization")
    credit_transactions = relationship("CreditTransaction", back_populates="organization")


class OrganizationUser(Base):
    __tablename__ = "organization_users"

    id = Column(String, primary_key=True, default=generate_uuid)
    organization_id = Column(String, ForeignKey("organizations.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    role = Column(String, nullable=False, default="MEMBER")  # OWNER, ADMIN, MEMBER

    organization = relationship("Organization", back_populates="members")
    user = relationship("User", back_populates="organization_memberships")


class SubscriptionPlan(Base):
    __tablename__ = "subscription_plans"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    price_minor_units = Column(Integer, nullable=False)  # e.g., in cents / paise
    currency = Column(String, default="INR")
    monthly_request_limit = Column(Integer, nullable=False)
    active = Column(Boolean, default=True)

    subscriptions = relationship("Subscription", back_populates="plan")


class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(String, primary_key=True, default=generate_uuid)
    organization_id = Column(String, ForeignKey("organizations.id"), nullable=False)
    plan_id = Column(String, ForeignKey("subscription_plans.id"), nullable=False)
    status = Column(String, nullable=False, default="ACTIVE")  # ACTIVE, EXPIRED, CANCELLED
    starts_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)
    provider_customer_id = Column(String, nullable=True)
    provider_subscription_id = Column(String, nullable=True)

    organization = relationship("Organization", back_populates="subscriptions")
    plan = relationship("SubscriptionPlan", back_populates="subscriptions")


class CreditTransaction(Base):
    __tablename__ = "credit_transactions"

    id = Column(String, primary_key=True, default=generate_uuid)
    organization_id = Column(String, ForeignKey("organizations.id"), nullable=False)
    type = Column(String, nullable=False)  # DEVELOPMENT_CREDIT, PURCHASE, VERIFICATION_USAGE, REFUND, ADJUSTMENT
    amount = Column(Integer, nullable=False)  # e.g., +5000, -1
    balance_after = Column(Integer, nullable=False)
    reference_id = Column(String, nullable=True)  # verification_id or payment_id
    description = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    organization = relationship("Organization", back_populates="credit_transactions")


class Payment(Base):
    __tablename__ = "payments"

    id = Column(String, primary_key=True, default=generate_uuid)
    organization_id = Column(String, ForeignKey("organizations.id"), nullable=False)
    provider = Column(String, nullable=False, default="RAZORPAY")
    provider_payment_id = Column(String, unique=True, nullable=False)
    amount_minor_units = Column(Integer, nullable=False)
    currency = Column(String, default="INR")
    order_id = Column(String, nullable=True, index=True)
    credits_added = Column(Integer, default=0)
    package_name = Column(String, nullable=True)
    status = Column(String, nullable=False, default="PENDING")
    raw_event_hash = Column(String, nullable=True)
    paid_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    organization = relationship("Organization", back_populates="payments")


class RentPayment(Base):
    __tablename__ = "rent_payments"

    id = Column(String, primary_key=True, default=generate_uuid)
    tenant_id = Column(String, ForeignKey("tenants.id"), nullable=False)
    landlord_id = Column(String, ForeignKey("organizations.id"), nullable=True)
    property_id = Column(String, ForeignKey("properties.id"), nullable=False)
    lease_id = Column(String, ForeignKey("leases.id"), nullable=False)
    rent_period = Column(String, nullable=False)
    amount = Column(Integer, nullable=False)
    due_date = Column(DateTime, nullable=False)
    paid_date = Column(DateTime, nullable=True)
    payment_method = Column(String, default="UPI")
    status = Column(String, nullable=False, default="PENDING")
    razorpay_order_id = Column(String, nullable=True, index=True)
    razorpay_payment_id = Column(String, nullable=True, index=True)
    receipt_id = Column(String, nullable=True, unique=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class APIKey(Base):
    __tablename__ = "api_keys"

    id = Column(String, primary_key=True, default=generate_uuid)
    organization_id = Column(String, ForeignKey("organizations.id"), nullable=False)
    key_prefix = Column(String, nullable=False)
    secret_hash = Column(String, nullable=False)
    status = Column(String, nullable=False, default="ACTIVE")  # ACTIVE, REVOKED
    created_at = Column(DateTime, default=datetime.utcnow)
    last_used_at = Column(DateTime, nullable=True)
    expires_at = Column(DateTime, nullable=True)

    organization = relationship("Organization", back_populates="api_keys")


class Tenant(Base):
    __tablename__ = "tenants"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    full_name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="tenant_profile")
    leases = relationship("Lease", back_populates="tenant")
    verifications = relationship("VerificationRequest", back_populates="tenant")
    consents = relationship("Consent", back_populates="tenant")


class Property(Base):
    __tablename__ = "properties"

    id = Column(String, primary_key=True, default=generate_uuid)
    organization_id = Column(String, ForeignKey("organizations.id"), nullable=False)
    name = Column(String, nullable=True)
    property_type = Column(String, default="APARTMENT")
    address_line1 = Column(String, nullable=False)
    city = Column(String, nullable=False)
    state = Column(String, nullable=False)
    postal_code = Column(String, nullable=False)
    country = Column(String, nullable=False, default="IN")
    number_of_units = Column(Integer, default=1)
    status = Column(String, default="ACTIVE")  # ACTIVE, INACTIVE, ARCHIVED
    created_at = Column(DateTime, default=datetime.utcnow)

    organization = relationship("Organization", back_populates="properties")
    leases = relationship("Lease", back_populates="property")


class Lease(Base):
    __tablename__ = "leases"

    id = Column(String, primary_key=True, default=generate_uuid)
    property_id = Column(String, ForeignKey("properties.id"), nullable=False)
    tenant_id = Column(String, ForeignKey("tenants.id"), nullable=False)
    unit_number = Column(String, nullable=True)
    monthly_rent_minor_units = Column(Integer, nullable=False)
    currency = Column(String, default="INR")
    due_day = Column(Integer, nullable=False, default=1)  # Day of month (1-31)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    status = Column(String, nullable=False, default="ACTIVE")  # ACTIVE, TERMINATED, EXPIRED, UPCOMING
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    property = relationship("Property", back_populates="leases")
    tenant = relationship("Tenant", back_populates="leases")
    verifications = relationship("VerificationRequest", back_populates="lease")


class VerificationRequest(Base):
    __tablename__ = "verification_requests"

    id = Column(String, primary_key=True, default=generate_uuid)
    external_id = Column(String, unique=True, default=generate_uuid)
    requester_organization_id = Column(String, ForeignKey("organizations.id"), nullable=False)
    tenant_id = Column(String, ForeignKey("tenants.id"), nullable=False)
    lease_id = Column(String, ForeignKey("leases.id"), nullable=False)
    period_start = Column(DateTime, nullable=False)
    period_end = Column(DateTime, nullable=False)
    status = Column(String, nullable=False, default="PENDING_CONSENT")  # PENDING_CONSENT, CONSENT_GRANTED, UPLOAD_PENDING, PROCESSING, COMPLETED, REQUIRES_REVIEW, REJECTED
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    share_token = Column(String, unique=True, index=True, nullable=True)
    share_token_expires_at = Column(DateTime, nullable=True)
    report_generated_at = Column(DateTime, nullable=True)
    report_shared_at = Column(DateTime, nullable=True)
    report_downloaded_at = Column(DateTime, nullable=True)

    requester_organization = relationship("Organization", back_populates="verifications")
    tenant = relationship("Tenant", back_populates="verifications")
    lease = relationship("Lease", back_populates="verifications")
    consents = relationship("Consent", back_populates="verification")
    transactions = relationship("Transaction", back_populates="verification")
    ai_results = relationship("AITransactionResult", back_populates="verification")
    result = relationship("VerificationResult", back_populates="verification", uselist=False)


class Consent(Base):
    __tablename__ = "consents"

    id = Column(String, primary_key=True, default=generate_uuid)
    verification_id = Column(String, ForeignKey("verification_requests.id"), nullable=False)
    tenant_id = Column(String, ForeignKey("tenants.id"), nullable=False)
    status = Column(String, nullable=False, default="PENDING")  # PENDING, APPROVED, REJECTED, REVOKED, EXPIRED
    scope = Column(String, default="RENT_VERIFICATION")
    granted_at = Column(DateTime, nullable=True)
    revoked_at = Column(DateTime, nullable=True)
    expires_at = Column(DateTime, nullable=True)

    verification = relationship("VerificationRequest", back_populates="consents")
    tenant = relationship("Tenant", back_populates="consents")


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(String, primary_key=True, default=generate_uuid)
    verification_id = Column(String, ForeignKey("verification_requests.id"), nullable=False)
    external_transaction_id = Column(String, nullable=True)
    transaction_date = Column(DateTime, nullable=False)
    amount_minor_units = Column(Integer, nullable=False)
    currency = Column(String, default="INR")
    description = Column(Text, nullable=True)
    payer = Column(String, nullable=True)
    payee = Column(String, nullable=True)
    is_rent_predicted = Column(Boolean, default=False)
    rent_probability = Column(Float, default=0.0)
    anomaly_score = Column(Float, default=0.0)
    anomaly_flag = Column(Boolean, default=False)

    verification = relationship("VerificationRequest", back_populates="transactions")
    ai_result = relationship("AITransactionResult", back_populates="transaction", uselist=False)


class VerificationResult(Base):
    __tablename__ = "verification_results"

    id = Column(String, primary_key=True, default=generate_uuid)
    verification_id = Column(String, ForeignKey("verification_requests.id"), unique=True, nullable=False)
    months_expected = Column(Integer, default=0)
    months_matched = Column(Integer, default=0)
    on_time_count = Column(Integer, default=0)
    late_count = Column(Integer, default=0)
    partial_count = Column(Integer, default=0)
    missed_count = Column(Integer, default=0)
    duplicate_count = Column(Integer, default=0)
    confidence_level = Column(Float, default=1.0)
    status = Column(String, nullable=False, default="VERIFIED")  # VERIFIED, REQUIRES_REVIEW, UNVERIFIED
    explanation_json = Column(JSON, nullable=True)
    finalized_at = Column(DateTime, default=datetime.utcnow)

    verification = relationship("VerificationRequest", back_populates="result")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String, primary_key=True, default=generate_uuid)
    actor_user_id = Column(String, nullable=True)
    action = Column(String, nullable=False)
    resource_type = Column(String, nullable=False)
    resource_id = Column(String, nullable=True)
    metadata_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    recipient = Column(String, nullable=False)
    title = Column(String, nullable=True)
    message = Column(Text, nullable=True)
    type = Column(String, nullable=False, default="SYSTEM")  # EMAIL, SYSTEM
    status = Column(String, default="SENT")  # PENDING, SENT, FAILED
    is_read = Column(Boolean, default=False)
    provider_message_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class WebhookEvent(Base):
    __tablename__ = "webhook_events"

    id = Column(String, primary_key=True, default=generate_uuid)
    provider = Column(String, nullable=False, default="RAZORPAY")
    event_id = Column(String, unique=True, nullable=False)
    event_type = Column(String, nullable=False)
    processed_at = Column(DateTime, default=datetime.utcnow)


class AITransactionResult(Base):
    __tablename__ = "ai_transaction_results"

    id = Column(String, primary_key=True, default=generate_uuid)
    transaction_id = Column(String, ForeignKey("transactions.id"), unique=True, nullable=False)
    verification_id = Column(String, ForeignKey("verification_requests.id"), nullable=False)
    classification = Column(String, nullable=False, default="NON_RENT")  # RENT, NON_RENT
    classification_confidence = Column(Float, nullable=False, default=0.0)
    is_anomaly = Column(Boolean, nullable=False, default=False)
    anomaly_score = Column(Float, nullable=False, default=0.0)
    review_reason = Column(Text, nullable=True)
    model_version = Column(String, nullable=False, default="rent-classifier-v1")
    anomaly_model_version = Column(String, nullable=False, default="anomaly-detector-v1")
    created_at = Column(DateTime, default=datetime.utcnow)

    transaction = relationship("Transaction", back_populates="ai_result")
    verification = relationship("VerificationRequest", back_populates="ai_results")
