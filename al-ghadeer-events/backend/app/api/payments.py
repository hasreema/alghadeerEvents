from datetime import datetime
from typing import Annotated, Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from beanie import PydanticObjectId

from app.core.dependencies import get_current_user, PaginationParams, DateRangeParams
from app.core.config import settings
from app.models.user import User
from app.models.payment import Payment
from app.models.event import Event
from app.models.enums import PaymentStatus
from app.api.schemas import (
    PaymentCreate,
    PaymentUpdate,
    PaymentResponse,
    PaginatedResponse,
    MessageResponse,
    FileUploadResponse,
)

router = APIRouter()


@router.get("/", response_model=PaginatedResponse)
async def get_payments(
    current_user: Annotated[User, Depends(get_current_user)],
    pagination: Annotated[PaginationParams, Depends()],
    date_range: Annotated[DateRangeParams, Depends()],
    event_id: Optional[str] = Query(None, description="Filter by event"),
    payment_status: Optional[str] = Query(None, description="Filter by status"),
    payment_method: Optional[str] = Query(None, description="Filter by method"),
    is_verified: Optional[bool] = Query(None, description="Filter by verification status"),
):
    """Get all payments with optional filters."""
    # Build query
    query_filter = {}
    
    if event_id:
        query_filter["event_id"] = event_id
    if payment_status:
        query_filter["payment_status"] = payment_status
    if payment_method:
        query_filter["payment_method"] = payment_method
    if is_verified is not None:
        query_filter["is_verified"] = is_verified
    
    # Date range filter
    if date_range.start_date or date_range.end_date:
        date_filter = {}
        if date_range.start_date:
            date_filter["$gte"] = datetime.fromisoformat(date_range.start_date)
        if date_range.end_date:
            date_filter["$lte"] = datetime.fromisoformat(date_range.end_date)
        query_filter["payment_date"] = date_filter
    
    # Get total count
    total = await Payment.find(query_filter).count()
    
    # Get paginated results
    payments = await Payment.find(query_filter).skip(
        pagination.skip
    ).limit(
        pagination.limit
    ).sort("-payment_date").to_list()
    
    # Calculate total pages
    total_pages = (total + pagination.limit - 1) // pagination.limit
    
    return {
        "items": payments,
        "total": total,
        "page": pagination.page,
        "page_size": pagination.page_size,
        "total_pages": total_pages,
    }


@router.get("/event/{event_id}", response_model=List[PaymentResponse])
async def get_event_payments(
    event_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Get all payments for a specific event."""
    payments = await Payment.find(
        Payment.event_id == event_id
    ).sort("-payment_date").to_list()
    
    return payments


@router.get("/outstanding")
async def get_outstanding_payments(
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Get summary of outstanding payments."""
    # Get all events with outstanding balance
    events = await Event.find(
        Event.outstanding_balance > 0,
        Event.status != "cancelled"
    ).to_list()
    
    total_outstanding = sum(e.outstanding_balance for e in events)
    
    # Group by status
    by_status = {}
    for event in events:
        status = event.payment_status
        if status not in by_status:
            by_status[status] = {"count": 0, "amount": 0}
        by_status[status]["count"] += 1
        by_status[status]["amount"] += event.outstanding_balance
    
    return {
        "total_outstanding": total_outstanding,
        "total_events": len(events),
        "by_status": by_status,
        "events": [
            {
                "id": str(event.id),
                "event_name": event.event_name,
                "event_date": event.event_date,
                "total_amount": event.pricing.total_price,
                "paid_amount": event.pricing.total_price - event.outstanding_balance,
                "outstanding_balance": event.outstanding_balance,
                "payment_status": event.payment_status,
            }
            for event in events[:10]  # Top 10
        ],
    }


@router.get("/{payment_id}", response_model=PaymentResponse)
async def get_payment(
    payment_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Get a specific payment by ID."""
    payment = await Payment.get(payment_id)
    
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
    
    return payment


@router.post("/", response_model=PaymentResponse)
async def create_payment(
    payment_data: PaymentCreate,
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Create a new payment."""
    # Verify event exists
    event = await Event.get(payment_data.event_id)
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    # Create payment
    payment = Payment(
        **payment_data.dict(),
        event_name=event.event_name,
        payment_status=PaymentStatus.PAID,
        created_by=str(current_user.id),
    )
    
    await payment.create()
    
    # Update event payment status
    # Calculate total paid for this event
    all_payments = await Payment.find(
        Payment.event_id == payment_data.event_id,
        Payment.payment_status == PaymentStatus.PAID
    ).to_list()
    
    total_paid = sum(p.amount for p in all_payments)
    
    if total_paid >= event.pricing.total_price:
        event.payment_status = PaymentStatus.PAID
        event.outstanding_balance = 0
    else:
        event.payment_status = PaymentStatus.PARTIAL
        event.outstanding_balance = event.pricing.total_price - total_paid
    
    event.update_timestamp(str(current_user.id))
    await event.save()
    
    return payment


@router.put("/{payment_id}", response_model=PaymentResponse)
async def update_payment(
    payment_id: str,
    payment_update: PaymentUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Update a payment."""
    payment = await Payment.get(payment_id)
    
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
    
    # Update fields
    update_data = payment_update.dict(exclude_unset=True)
    
    # Handle verification
    if "is_verified" in update_data and update_data["is_verified"]:
        update_data["verified_by"] = str(current_user.id)
        update_data["verified_at"] = datetime.utcnow()
    
    for field, value in update_data.items():
        setattr(payment, field, value)
    
    payment.update_timestamp(str(current_user.id))
    await payment.save()
    
    return payment


@router.post("/{payment_id}/upload-receipt", response_model=FileUploadResponse)
async def upload_receipt(
    payment_id: str,
    file: UploadFile = File(...),
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Upload receipt for a payment."""
    payment = await Payment.get(payment_id)
    
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
    
    # Validate file type
    if file.content_type not in settings.allowed_file_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type not allowed. Allowed types: {settings.allowed_file_types}"
        )
    
    # Validate file size
    if file.size > settings.max_file_size:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Maximum size: {settings.max_file_size} bytes"
        )
    
    # TODO: Implement actual file upload to storage
    # For now, just simulate
    file_url = f"/uploads/receipts/{payment_id}/{file.filename}"
    
    # Update payment with receipt URL
    payment.receipt_url = file_url
    payment.update_timestamp(str(current_user.id))
    await payment.save()
    
    return {
        "filename": file.filename,
        "url": file_url,
        "size": file.size,
        "content_type": file.content_type,
    }


@router.post("/{payment_id}/refund", response_model=PaymentResponse)
async def refund_payment(
    payment_id: str,
    refund_amount: float,
    refund_reason: str,
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Process a refund for a payment."""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can process refunds"
        )
    
    payment = await Payment.get(payment_id)
    
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
    
    if payment.is_refunded:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment already refunded"
        )
    
    if refund_amount > payment.amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Refund amount cannot exceed payment amount"
        )
    
    # Process refund
    payment.is_refunded = True
    payment.refund_amount = refund_amount
    payment.refund_date = datetime.utcnow()
    payment.refund_reason = refund_reason
    payment.payment_status = PaymentStatus.REFUNDED
    payment.update_timestamp(str(current_user.id))
    
    await payment.save()
    
    # Update event payment status
    event = await Event.get(payment.event_id)
    if event:
        # Recalculate total paid
        all_payments = await Payment.find(
            Payment.event_id == payment.event_id,
            Payment.payment_status == PaymentStatus.PAID
        ).to_list()
        
        total_paid = sum(p.amount - (p.refund_amount or 0) for p in all_payments)
        
        if total_paid >= event.pricing.total_price:
            event.payment_status = PaymentStatus.PAID
            event.outstanding_balance = 0
        elif total_paid > 0:
            event.payment_status = PaymentStatus.PARTIAL
            event.outstanding_balance = event.pricing.total_price - total_paid
        else:
            event.payment_status = PaymentStatus.PENDING
            event.outstanding_balance = event.pricing.total_price
        
        event.update_timestamp(str(current_user.id))
        await event.save()
    
    return payment