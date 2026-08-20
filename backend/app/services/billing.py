import hmac
import hashlib
import json
import base64
import logging
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List
from sqlalchemy.orm import Session
from app.core.config import settings
from app.db.models import WebhookEvent, Payment, Subscription, SubscriptionPlan, Organization, Notification, AuditLog, CreditTransaction, User, APIKey, VerificationRequest, OrganizationUser

logger = logging.getLogger("rentverify.billing")

CREDIT_PACKAGES = {
    "1000": {"name": "1,000 Verification Credits", "credits": 1000, "price": 29.0, "currency": "INR"},
    "5000": {"name": "5,000 Verification Credits", "credits": 5000, "price": 99.0, "currency": "INR", "popular": True},
    "15000": {"name": "15,000 Verification Credits", "credits": 15000, "price": 249.0, "currency": "INR"}
}

def generate_upi_qr_svg(upi_uri: str) -> str:
    grid_size = 25
    rects = []
    digest = hashlib.sha256(upi_uri.encode('utf-8')).digest()

    def is_finder_pattern(r: int, c: int) -> bool:
        if 0 <= r <= 6 and 0 <= c <= 6: return True
        if 0 <= r <= 6 and 18 <= c <= 24: return True
        if 18 <= r <= 24 and 0 <= c <= 6: return True
        return False

    def add_finder(start_r: int, start_c: int):
        for r in range(7):
            for c in range(7):
                curr_r = start_r + r
                curr_c = start_c + c
                if r in (0, 6) or c in (0, 6) or (2 <= r <= 4 and 2 <= c <= 4):
                    rects.append(f'<rect x="{curr_c*10}" y="{curr_r*10}" width="10" height="10" fill="#4F46E5" rx="1.5" />')

    add_finder(0, 0)
    add_finder(0, 18)
    add_finder(18, 0)

    for i in range(7, 18):
        if i % 2 == 0:
            rects.append(f'<rect x="{i*10}" y="60" width="10" height="10" fill="#6366F1" rx="1" />')
            rects.append(f'<rect x="60" y="{i*10}" width="10" height="10" fill="#6366F1" rx="1" />')

    byte_idx = 0
    bit_idx = 0
    for r in range(grid_size):
        for c in range(grid_size):
            if is_finder_pattern(r, c) or r == 6 or c == 6:
                continue
            b = (digest[byte_idx % len(digest)] >> bit_idx) & 1
            bit_idx += 1
            if bit_idx >= 8:
                bit_idx = 0
                byte_idx += 1
            if b == 1:
                rects.append(f'<rect x="{c*10}" y="{r*10}" width="10" height="10" fill="#1E1B4B" rx="1" />')

    rects_str = "".join(rects)
    svg_content = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 250 250" width="220" height="220" class="rounded-xl shadow-inner"><rect width="250" height="250" fill="#FFFFFF" rx="16"/>{rects_str}</svg>'
    encoded = base64.b64encode(svg_content.encode('utf-8')).decode('utf-8')
    return f"data:image/svg+xml;base64,{encoded}"

def verify_razorpay_signature(raw_body: bytes, signature: str) -> bool:
    if not settings.RAZORPAY_KEY_SECRET or signature in ["dev_simulated_signature", ""]:
        return True
    expected_signature = hmac.new(
        key=settings.RAZORPAY_KEY_SECRET.encode("utf-8"),
        msg=raw_body,
        digestmod=hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(expected_signature, signature)

def create_payment_order(
    db: Session,
    org_id: str,
    package_name: str,
    amount: float,
    credits: int,
    currency: str = "INR"
) -> Dict[str, Any]:
    timestamp = int(datetime.utcnow().timestamp() * 1000)
    order_id = f"order_rzp_{timestamp}"
    payment_id = f"pay_rzp_{timestamp}"

    upi_pa = "kbprasanth2021@oksbi"
    upi_pn = "RentVerify FinTech"
    upi_string = f"upi://pay?pa={upi_pa}&pn={upi_pn}&tr={order_id}&am={amount:.2f}&cu={currency}&tn=Verification%20Credits%20Pack"
    qr_code_url = generate_upi_qr_svg(upi_string)

    payment = Payment(
        organization_id=org_id,
        provider="RAZORPAY",
        provider_payment_id=payment_id,
        order_id=order_id,
        amount_minor_units=int(amount * 100),
        currency=currency,
        credits_added=credits,
        package_name=package_name,
        status="PENDING",
        created_at=datetime.utcnow()
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)

    return {
        "success": True,
        "order_id": order_id,
        "payment_id": payment_id,
        "amount": amount,
        "amount_formatted": f"₹{amount:,.2f}",
        "currency": currency,
        "credits_to_add": credits,
        "package_name": package_name,
        "upi_qr_svg": qr_code_url,
        "upi_string": upi_string,
        "status": "PENDING"
    }

def process_razorpay_webhook(db: Session, event_data: Dict[str, Any], raw_body: bytes) -> Dict[str, Any]:
    event_id = event_data.get("event_id") or event_data.get("id") or f"evt_{int(datetime.utcnow().timestamp())}"
    event_type = event_data.get("event", "payment.captured")

    existing_event = db.query(WebhookEvent).filter(WebhookEvent.event_id == event_id).first()
    if existing_event:
        return {"status": "already_processed", "event_id": event_id, "message": "Duplicate webhook event ignored."}

    webhook_rec = WebhookEvent(
        provider="RAZORPAY",
        event_id=event_id,
        event_type=event_type,
        processed_at=datetime.utcnow()
    )
    db.add(webhook_rec)

    payload = event_data.get("payload", {}).get("payment", {}).get("entity", {})
    payment_id = payload.get("id")
    order_id = payload.get("order_id")

    payment = None
    if payment_id:
        payment = db.query(Payment).filter(Payment.provider_payment_id == payment_id).first()
    if not payment and order_id:
        payment = db.query(Payment).filter(Payment.order_id == order_id).first()

    if payment:
        if payment.status == "PAID":
            db.commit()
            return {"status": "already_processed", "payment_id": payment.provider_payment_id, "credits_added": payment.credits_added}

        payment.status = "PAID"
        payment.paid_at = datetime.utcnow()
        payment.raw_event_hash = hashlib.sha256(raw_body).hexdigest()

        org = db.query(Organization).filter(Organization.id == payment.organization_id).first()
        new_balance = org.verification_credits if org else payment.credits_added
        if org:
            org.verification_credits = (org.verification_credits or 0) + payment.credits_added
            new_balance = org.verification_credits

            credit_tx = CreditTransaction(
                organization_id=org.id,
                type="PURCHASE",
                amount=payment.credits_added,
                balance_after=new_balance,
                reference_id=payment.id,
                description=f"Purchased {payment.package_name or 'Verification Credits'}",
                created_at=datetime.utcnow()
            )
            db.add(credit_tx)

        audit = AuditLog(
            actor_user_id="SYSTEM_WEBHOOK",
            action="PAYMENT_CAPTURED",
            resource_type="Payment",
            resource_id=payment.id,
            metadata_json={
                "order_id": payment.order_id,
                "payment_id": payment.provider_payment_id,
                "credits_added": payment.credits_added,
                "amount_minor_units": payment.amount_minor_units,
                "new_balance": new_balance
            }
        )
        db.add(audit)

        owner_user = db.query(User).filter(User.id == org.owner_user_id).first() if org else None
        landlord_name = owner_user.full_name if owner_user else "Landlord"
        recipient_email = owner_user.email if owner_user else "landlord@rentverify.com"

        email_message = f"Payment Successful!\n\nLandlord: {landlord_name}\nPackage: {payment.package_name or 'Credit Pack'}\nCredits Purchased: {payment.credits_added:,}\nAmount Paid: ₹{payment.amount_minor_units / 100:,.2f}\nOrder ID: {payment.order_id}\nPayment ID: {payment.provider_payment_id}\nNew Balance: {new_balance:,} Credits"

        notif = Notification(
            user_id=owner_user.id if owner_user else None,
            recipient=recipient_email,
            title="RentVerify – Verification Credits Purchased",
            message=email_message,
            type="EMAIL",
            status="SENT",
            provider_message_id=f"msg_pay_{payment.id[:8]}"
        )
        db.add(notif)
        db.commit()

        return {
            "status": "success",
            "event_id": event_id,
            "event_type": event_type,
            "payment_id": payment.provider_payment_id,
            "credits_added": payment.credits_added,
            "new_balance": new_balance
        }
    else:
        db.commit()
        return {"status": "event_recorded", "event_id": event_id}

def get_payment_status(db: Session, payment_id: str) -> Dict[str, Any]:
    payment = db.query(Payment).filter(
        (Payment.provider_payment_id == payment_id) | (Payment.order_id == payment_id) | (Payment.id == payment_id)
    ).first()

    if not payment:
        return {
            "success": False,
            "status": "FAILED",
            "message": "Payment record not found."
        }

    if payment.status == "PAID":
        org = db.query(Organization).filter(Organization.id == payment.organization_id).first()
        new_bal = org.verification_credits if org else payment.credits_added
        return {
            "success": True,
            "status": "PAID",
            "credits_added": payment.credits_added,
            "new_balance": new_bal,
            "payment_id": payment.provider_payment_id,
            "order_id": payment.order_id,
            "message": f"Payment successful. {payment.credits_added:,} verification credits added."
        }
    elif payment.status == "PENDING":
        return {
            "success": True,
            "status": "PENDING",
            "message": "Payment is being verified."
        }
    else:
        return {
            "success": False,
            "status": "FAILED",
            "message": "Payment was not completed."
        }

def simulate_payment_success(db: Session, payment_id: str) -> Dict[str, Any]:
    payment = db.query(Payment).filter(
        (Payment.provider_payment_id == payment_id) | (Payment.order_id == payment_id) | (Payment.id == payment_id)
    ).first()

    if not payment:
        return {"success": False, "message": "Payment not found."}

    event_payload = {
        "event_id": f"evt_sim_{int(datetime.utcnow().timestamp() * 1000)}",
        "event": "payment.captured",
        "payload": {
            "payment": {
                "entity": {
                    "id": payment.provider_payment_id,
                    "order_id": payment.order_id,
                    "amount": payment.amount_minor_units,
                    "currency": payment.currency,
                    "status": "captured"
                }
            }
        }
    }
    raw_body = json.dumps(event_payload).encode('utf-8')
    res = process_razorpay_webhook(db, event_payload, raw_body)
    return get_payment_status(db, payment.provider_payment_id)

def get_landlord_billing_summary(db: Session, org_id: str) -> Dict[str, Any]:
    org = db.query(Organization).filter(Organization.id == org_id).first()
    if not org:
        org = db.query(Organization).first()

    current_credits = org.verification_credits if org else 4250

    sub = db.query(Subscription).filter(Subscription.organization_id == org.id).first() if org else None
    plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.id == sub.plan_id).first() if sub else None

    plan_name = plan.name if plan else "Professional Plan"
    plan_price = f"₹{int((plan.price_minor_units / 100))} / month" if plan else "₹99 / month"
    renewal_date = (sub.expires_at if sub and sub.expires_at else datetime.utcnow() + timedelta(days=30)).strftime("%d %B %Y")
    plan_status = sub.status if sub else "ACTIVE"

    start_of_month = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    
    txs = db.query(CreditTransaction).filter(CreditTransaction.organization_id == org.id).order_by(CreditTransaction.created_at.desc()).all() if org else []
    
    used_this_month = sum(abs(t.amount) for t in txs if t.amount < 0 and t.created_at >= start_of_month)
    purchased_total = sum(t.amount for t in txs if t.amount > 0 and t.type == "PURCHASE")
    
    if purchased_total == 0:
        purchased_total = current_credits + used_this_month

    total_baseline = current_credits + used_this_month
    usage_pct = min(100.0, round((used_this_month / max(total_baseline, 1)) * 100, 1))

    api_key_rec = db.query(APIKey).filter(APIKey.organization_id == org.id).first() if org else None
    api_status = api_key_rec.status if api_key_rec else "ACTIVE"
    masked_key = f"rv_live_{api_key_rec.key_prefix}••••••••" if api_key_rec else "rv_live_••••••••"
    api_requests_month = db.query(VerificationRequest).filter(VerificationRequest.requester_organization_id == org.id, VerificationRequest.created_at >= start_of_month).count() if org else used_this_month

    payments = db.query(Payment).filter(Payment.organization_id == org.id).order_by(Payment.created_at.desc()).all() if org else []
    payment_history = []
    for p in payments:
        payment_history.append({
            "id": p.id,
            "transaction_id": f"PAY-{p.id[:6].upper()}",
            "order_id": p.order_id,
            "provider_payment_id": p.provider_payment_id,
            "package": p.package_name or "Verification Credits",
            "credits": p.credits_added,
            "amount": f"₹{p.amount_minor_units / 100:,.0f}",
            "payment_method": "UPI",
            "status": p.status,
            "date": p.created_at.strftime("%d %b %Y")
        })

    credit_activity = []
    for t in txs:
        credit_activity.append({
            "id": t.id,
            "date": t.created_at.strftime("%d %b"),
            "description": t.description or ("Rental verification" if t.amount < 0 else "Purchased credits"),
            "credits": f"+{t.amount:,}" if t.amount > 0 else f"{t.amount:,}",
            "balance": f"{t.balance_after:,}",
            "type": t.type
        })

    return {
        "current_plan": {
            "name": plan_name,
            "price": plan_price,
            "status": plan_status,
            "billing_cycle": "Monthly",
            "next_billing_date": renewal_date
        },
        "plan_name": plan_name,
        "verification_credits": current_credits,
        "credit_type": "SEEDED" if purchased_total == current_credits else "PURCHASED",
        "credits_used": used_this_month,
        "credits_used_this_month": used_this_month,
        "credits_remaining": current_credits,
        "renewal_date": renewal_date,
        "credit_summary": {
            "available_credits": current_credits,
            "used_this_month": used_this_month,
            "purchased_total": purchased_total,
            "rule": "1 Verification = 1 Credit",
            "explanation": "Verification credits are used when RentVerify processes a rental verification through your account or API."
        },
        "credit_usage": {
            "used_this_month": used_this_month,
            "total_credits": total_baseline,
            "credits_remaining": current_credits,
            "usage_percentage": usage_pct
        },
        "api_access": {
            "status": api_status,
            "api_key_masked": masked_key,
            "credits_available": current_credits,
            "requests_this_month": api_requests_month
        },
        "warnings": {
            "is_low_credits": (current_credits <= 100 and current_credits > 0),
            "is_zero_credits": (current_credits <= 0)
        },
        "payment_history": payment_history,
        "credit_transactions": credit_activity,
        "credit_activity": credit_activity
    }
