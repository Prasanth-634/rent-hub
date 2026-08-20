from sqlalchemy.orm import Session
from app.core.database import Base, engine
from app.core.security import get_password_hash
from app.db.models import User, Organization, OrganizationUser, SubscriptionPlan, Tenant, CreditTransaction


def init_db(db: Session):
    Base.metadata.create_all(bind=engine)

    # Ensure status column exists on users table for existing DBs
    try:
        from sqlalchemy import text
        db.execute(text("ALTER TABLE users ADD COLUMN status VARCHAR DEFAULT 'ACTIVE'"))
        db.commit()
    except Exception:
        db.rollback()

    # Seed Default Subscription Plans if empty
    if not db.query(SubscriptionPlan).first():
        plans = [
            SubscriptionPlan(
                name="Starter Plan",
                price_minor_units=499900,  # ₹4,999 / mo
                currency="INR",
                monthly_request_limit=50,
                active=True,
            ),
            SubscriptionPlan(
                name="Growth Plan",
                price_minor_units=1499900,  # ₹14,999 / mo
                currency="INR",
                monthly_request_limit=250,
                active=True,
            ),
            SubscriptionPlan(
                name="Enterprise Plan",
                price_minor_units=4999900,  # ₹49,999 / mo
                currency="INR",
                monthly_request_limit=10000,
                active=True,
            ),
        ]
        db.add_all(plans)
        db.commit()

    # Helper function to seed role user & organization
    def seed_user(email: str, password: str, full_name: str, role: str, org_name: str):
        user = db.query(User).filter(User.email == email).first()
        if not user:
            user = User(
                email=email,
                password_hash=get_password_hash(password),
                full_name=full_name,
                role=role,
                is_active=True,
                is_verified=True,
                token_version=1
            )
            db.add(user)
            db.commit()
            db.refresh(user)

            org = Organization(name=org_name, type=role, owner_user_id=user.id, verification_credits=5000 if role != "LENDER" else 15000)
            db.add(org)
            db.commit()
            db.refresh(org)

            # Create initial CreditTransaction ledger entry if not existing
            tx = db.query(CreditTransaction).filter(CreditTransaction.organization_id == org.id).first()
            if not tx:
                init_tx = CreditTransaction(
                    organization_id=org.id,
                    type="DEVELOPMENT_CREDIT",
                    amount=org.verification_credits,
                    balance_after=org.verification_credits,
                    description="Initial Development Credits"
                )
                db.add(init_tx)
                db.commit()

            org_user = OrganizationUser(organization_id=org.id, user_id=user.id, role="OWNER")
            db.add(org_user)
            db.commit()

            if role == "TENANT":
                tenant_profile = db.query(Tenant).filter(Tenant.email == email).first()
                if not tenant_profile:
                    tenant_profile = Tenant(user_id=user.id, full_name=full_name, email=email, phone="+919876543210")
                    db.add(tenant_profile)
                    db.commit()

            if role == "LANDLORD":
                from app.db.models import Property
                prop = db.query(Property).filter(Property.organization_id == org.id).first()
                if not prop:
                    prop = Property(
                        organization_id=org.id,
                        name="Sunrise Heights Villa",
                        property_type="SINGLE_FAMILY",
                        address_line1="123 Palm Avenue",
                        city="Bangalore",
                        state="Karnataka",
                        postal_code="560001",
                        country="IN",
                        number_of_units=1,
                        status="ACTIVE"
                    )
                    db.add(prop)
                    db.commit()

    # 1. Admin
    seed_user("admin@rentverify.com", "AdminSecret123!", "System Administrator", "ADMIN", "RentVerify Platform Admin")
    # 2. Landlord
    seed_user("landlord@rentverify.com", "LandlordSecret123!", "Apex Property Manager", "LANDLORD", "Apex Housing LLC")
    # 3. Lender
    seed_user("lender@rentverify.com", "LenderSecret123!", "Capital Bank Underwriter", "LENDER", "Capital Lending Group")
    # 4. Tenant
    seed_user("tenant@rentverify.com", "TenantSecret123!", "Alex Johnson", "TENANT", "Alex Johnson Personal")

    try:
        engine.execute(text("ALTER TABLE users ADD COLUMN firebase_uid VARCHAR"))
    except Exception:
        pass
