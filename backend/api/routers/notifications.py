from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, EmailStr
from typing import List, Optional

from models.user import User
from auth.auth import get_current_user, require_admin_or_staff

router = APIRouter()

class EmailNotification(BaseModel):
    to: EmailStr
    subject: str
    body: str
    is_html: bool = False

class WhatsAppNotification(BaseModel):
    to: str  # Phone number
    message: str

class PushNotification(BaseModel):
    user_ids: List[str]
    title: str
    body: str
    data: Optional[dict] = None

@router.post("/email")
async def send_email(
    notification: EmailNotification,
    current_user: User = Depends(require_admin_or_staff)
):
    """Send email notification"""
    # TODO: Implement email sending using Gmail API or SMTP
    return {
        "message": f"Email sent to {notification.to}",
        "subject": notification.subject,
        "sent_by": current_user.email
    }

@router.post("/whatsapp")
async def send_whatsapp(
    notification: WhatsAppNotification,
    current_user: User = Depends(require_admin_or_staff)
):
    """Send WhatsApp message"""
    # TODO: Implement WhatsApp Business API integration
    return {
        "message": f"WhatsApp message sent to {notification.to}",
        "content": notification.message,
        "sent_by": current_user.email
    }

@router.post("/push")
async def send_push_notification(
    notification: PushNotification,
    current_user: User = Depends(require_admin_or_staff)
):
    """Send push notification"""
    # TODO: Implement push notification service
    return {
        "message": f"Push notification sent to {len(notification.user_ids)} users",
        "title": notification.title,
        "sent_by": current_user.email
    }

@router.post("/reminder/{reminder_id}/send")
async def send_reminder_notification(
    reminder_id: str,
    current_user: User = Depends(require_admin_or_staff)
):
    """Send notification for a specific reminder"""
    from models.reminder import Reminder
    
    reminder = await Reminder.get(reminder_id)
    if not reminder:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reminder not found"
        )
    
    # TODO: Send notification based on reminder channels
    return {"message": f"Reminder notification sent for: {reminder.title}"}

@router.post("/event/{event_id}/notify-team")
async def notify_team_about_event(
    event_id: str,
    message: str,
    current_user: User = Depends(require_admin_or_staff)
):
    """Send notification to team about an event"""
    from models.event import Event
    
    event = await Event.get(event_id)
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    # TODO: Send to assigned employees
    return {
        "message": f"Team notification sent for event: {event.title}",
        "recipients": event.assigned_employees
    }

@router.post("/payment-reminder/{event_id}")
async def send_payment_reminder(
    event_id: str,
    current_user: User = Depends(require_admin_or_staff)
):
    """Send payment reminder for an event"""
    from models.event import Event
    
    event = await Event.get(event_id)
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    outstanding_balance = event.get_outstanding_balance()
    
    if outstanding_balance <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No outstanding balance for this event"
        )
    
    # TODO: Send payment reminder to client
    return {
        "message": f"Payment reminder sent for event: {event.title}",
        "outstanding_amount": outstanding_balance,
        "client": event.contact.client_name
    }

@router.get("/templates")
async def get_notification_templates(current_user: User = Depends(get_current_user)):
    """Get available notification templates"""
    templates = {
        "email": [
            {
                "name": "Event Confirmation",
                "subject": "Event Booking Confirmed - {event_title}",
                "body": "Dear {client_name},\n\nYour event '{event_title}' has been confirmed for {event_date}.\n\nThank you for choosing Al Ghadeer Events."
            },
            {
                "name": "Payment Reminder",
                "subject": "Payment Reminder - {event_title}",
                "body": "Dear {client_name},\n\nThis is a reminder that you have an outstanding balance of {amount} for your event '{event_title}'.\n\nPlease arrange payment at your earliest convenience."
            }
        ],
        "whatsapp": [
            {
                "name": "Event Reminder",
                "message": "Hello {client_name}! This is a reminder that your event '{event_title}' is scheduled for {event_date}. We're looking forward to making it special! - Al Ghadeer Events"
            },
            {
                "name": "Staff Assignment",
                "message": "Hello {employee_name}! You have been assigned to work at '{event_title}' on {event_date}. Please confirm your availability. - Al Ghadeer Events"
            }
        ]
    }
    
    return templates