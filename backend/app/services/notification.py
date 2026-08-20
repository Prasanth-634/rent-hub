import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from sqlalchemy.orm import Session
from app.core.config import settings
from app.db.models import Notification


def send_email_notification(db: Session, recipient: str, subject: str, body: str) -> Notification:
    notification = Notification(
        recipient=recipient,
        type="EMAIL",
        status="SENT",
        provider_message_id=None
    )
    
    if settings.SMTP_USERNAME and settings.SMTP_PASSWORD:
        try:
            msg = MIMEMultipart()
            msg["From"] = settings.SMTP_FROM
            msg["To"] = recipient
            msg["Subject"] = subject
            msg.attach(MIMEText(body, "html"))

            server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)
            server.starttls()
            server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
            server.send_message(msg)
            server.quit()
            notification.status = "SENT"
        except Exception:
            notification.status = "FAILED"
    else:
        # Development mode simulation
        notification.status = "SENT"

    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification


def send_email_with_pdf_attachment(
    db: Session,
    recipient: str,
    subject: str,
    body: str,
    pdf_bytes: bytes = None,
    filename: str = "Verification_Report.pdf"
) -> Notification:
    from email.mime.application import MIMEApplication

    notification = Notification(
        recipient=recipient,
        type="EMAIL",
        status="SENT",
        provider_message_id=None
    )

    if settings.SMTP_USERNAME and settings.SMTP_PASSWORD:
        try:
            msg = MIMEMultipart()
            msg["From"] = settings.SMTP_FROM
            msg["To"] = recipient
            msg["Subject"] = subject
            msg.attach(MIMEText(body, "html"))

            if pdf_bytes:
                part = MIMEApplication(pdf_bytes, Name=filename)
                part['Content-Disposition'] = f'attachment; filename="{filename}"'
                msg.attach(part)

            server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)
            server.starttls()
            server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
            server.send_message(msg)
            server.quit()
            notification.status = "SENT"
        except Exception:
            notification.status = "FAILED"
    else:
        # Development mode simulation
        notification.status = "SENT"

    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification
