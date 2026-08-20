import json
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.audit import log_audit_event
from app.db.models import User, SubscriptionPlan, Subscription, Payment, Organization
from app.schemas.billing_admin import (
    SubscriptionPlanResponse, CheckoutRequest, CheckoutResponse,
    CreateOrderRequest, CreateOrderResponse, PaymentStatusResponse
)
from app.api.deps import get_current_user, get_user_organization, oauth2_scheme
from app.services.billing import (
    create_payment_order, process_razorpay_webhook, verify_razorpay_signature,
    get_payment_status, simulate_payment_success
)
from app.core.config import settings

router = APIRouter(tags=["Billing & Payments"])


def get_optional_current_user(
    db: Session = Depends(get_db),
    token: Optional[str] = Depends(oauth2_scheme)
) -> Optional[User]:
    if not token:
        return None
    try:
        return get_current_user(db=db, token=token)
    except Exception:
        return None


@router.get("/plans", response_model=List[SubscriptionPlanResponse])
def list_plans(db: Session = Depends(get_db)):
    return db.query(SubscriptionPlan).filter(SubscriptionPlan.active == True).all()


@router.post("/billing/checkout", response_model=CheckoutResponse)
def create_checkout_session(req: CheckoutRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.id == req.plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Subscription plan not found")

    org = get_user_organization(db, current_user)
    if not org:
        raise HTTPException(status_code=400, detail="User organization not found")

    order_id = f"order_{int(db.query(Payment).count()) + 1001}"
    log_audit_event(db, action="CREATE_CHECKOUT_SESSION", resource_type="SubscriptionPlan", resource_id=plan.id, actor_user_id=current_user.id)

    return CheckoutResponse(
        order_id=order_id,
        amount_minor_units=plan.price_minor_units,
        currency=plan.currency,
        razorpay_key_id=settings.RAZORPAY_KEY_ID or "rzp_test_demo"
    )


@router.get("/billing/subscription")
def get_current_subscription(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    org = get_user_organization(db, current_user) if current_user else db.query(Organization).first()
    if not org:
        return {"status": "NO_ORGANIZATION"}

    sub = db.query(Subscription).filter(Subscription.organization_id == org.id).first()
    plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.id == sub.plan_id).first() if sub else None

    return {
        "id": sub.id if sub else "sub_default",
        "status": sub.status if sub else "ACTIVE",
        "starts_at": sub.starts_at if sub else None,
        "expires_at": sub.expires_at if sub else None,
        "verification_credits": org.verification_credits or 5000,
        "plan": {
            "name": plan.name if plan else "Professional Plan",
            "monthly_request_limit": plan.monthly_request_limit if plan else 5000
        }
    }


# =====================================================================
# UPI QR & Razorpay Webhook Payment Endpoints
# =====================================================================

@router.post("/payments/create-order", response_model=CreateOrderResponse)
def create_order(
    req: CreateOrderRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    org = get_user_organization(db, current_user) if current_user else None
    if not org:
        org = db.query(Organization).first()

    org_id = org.id if org else "default_org"

    res = create_payment_order(
        db=db,
        org_id=org_id,
        package_name=req.package_name,
        amount=req.amount,
        credits=req.credits,
        currency=req.currency or "INR"
    )
    return res


@router.post("/payments/webhook/razorpay")
@router.post("/billing/webhooks/razorpay")
async def razorpay_webhook(request: Request, db: Session = Depends(get_db)):
    body_bytes = await request.body()
    signature = request.headers.get("X-Razorpay-Signature", "")

    if not verify_razorpay_signature(body_bytes, signature):
        raise HTTPException(status_code=400, detail="Invalid Razorpay webhook signature")

    try:
        event_payload = json.loads(body_bytes.decode("utf-8"))
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    res = process_razorpay_webhook(db, event_payload, body_bytes)
    return res


@router.get("/payments/{payment_id}/status", response_model=PaymentStatusResponse)
def check_payment_status(payment_id: str, db: Session = Depends(get_db)):
    return get_payment_status(db, payment_id)


@router.post("/payments/simulate-webhook")
@router.post("/payments/{payment_id}/simulate-webhook")
async def simulate_webhook_endpoint(
    request: Request,
    payment_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    target_id = payment_id
    if not target_id:
        try:
            body = await request.json()
            target_id = body.get("payment_id") or body.get("order_id")
        except Exception:
            pass

    if not target_id:
        raise HTTPException(status_code=400, detail="Missing payment_id or order_id in request")

    return simulate_payment_success(db, target_id)

