from fastapi import APIRouter, HTTPException, status, Depends, Query, UploadFile, File
from typing import List, Optional
from datetime import datetime

from models.payment import Payment, PaymentCreate, PaymentUpdate, PaymentResponse, PaymentStats
from models.user import User
from auth.auth import get_current_user, require_admin_or_staff

router = APIRouter()

@router.post("/", response_model=PaymentResponse)
async def create_payment(
    payment_data: PaymentCreate,
    current_user: User = Depends(require_admin_or_staff)
):
    """Create a new payment record"""
    payment = Payment(
        **payment_data.dict(),
        created_by=str(current_user.id)
    )
    
    await payment.insert()
    
    return PaymentResponse(
        id=str(payment.id),
        event_id=payment.event_id,
        amount=payment.amount,
        payment_method=payment.payment_method,
        payment_type=payment.payment_type,
        payment_date=payment.payment_date,
        reference_number=payment.reference_number,
        receipt_number=payment.receipt_number,
        receipt=payment.receipt,
        bank_name=payment.bank_name,
        account_number=payment.account_number,
        transaction_id=payment.transaction_id,
        notes=payment.notes,
        is_verified=payment.is_verified,
        verified_by=payment.verified_by,
        verified_at=payment.verified_at,
        created_at=payment.created_at,
        updated_at=payment.updated_at
    )

@router.get("/", response_model=List[PaymentResponse])
async def get_payments(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    event_id: Optional[str] = None,
    is_verified: Optional[bool] = None,
    current_user: User = Depends(get_current_user)
):
    """Get payments with filtering"""
    query = {}
    
    if event_id:
        query["event_id"] = event_id
    if is_verified is not None:
        query["is_verified"] = is_verified
    
    if query:
        payments = await Payment.find(query).skip(skip).limit(limit).to_list()
    else:
        payments = await Payment.find_all().skip(skip).limit(limit).to_list()
    
    return [
        PaymentResponse(
            id=str(payment.id),
            event_id=payment.event_id,
            amount=payment.amount,
            payment_method=payment.payment_method,
            payment_type=payment.payment_type,
            payment_date=payment.payment_date,
            reference_number=payment.reference_number,
            receipt_number=payment.receipt_number,
            receipt=payment.receipt,
            bank_name=payment.bank_name,
            account_number=payment.account_number,
            transaction_id=payment.transaction_id,
            notes=payment.notes,
            is_verified=payment.is_verified,
            verified_by=payment.verified_by,
            verified_at=payment.verified_at,
            created_at=payment.created_at,
            updated_at=payment.updated_at
        )
        for payment in payments
    ]

@router.get("/{payment_id}", response_model=PaymentResponse)
async def get_payment(payment_id: str, current_user: User = Depends(get_current_user)):
    """Get payment by ID"""
    payment = await Payment.get(payment_id)
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
    
    return PaymentResponse(
        id=str(payment.id),
        event_id=payment.event_id,
        amount=payment.amount,
        payment_method=payment.payment_method,
        payment_type=payment.payment_type,
        payment_date=payment.payment_date,
        reference_number=payment.reference_number,
        receipt_number=payment.receipt_number,
        receipt=payment.receipt,
        bank_name=payment.bank_name,
        account_number=payment.account_number,
        transaction_id=payment.transaction_id,
        notes=payment.notes,
        is_verified=payment.is_verified,
        verified_by=payment.verified_by,
        verified_at=payment.verified_at,
        created_at=payment.created_at,
        updated_at=payment.updated_at
    )

@router.put("/{payment_id}", response_model=PaymentResponse)
async def update_payment(
    payment_id: str,
    payment_update: PaymentUpdate,
    current_user: User = Depends(require_admin_or_staff)
):
    """Update payment"""
    payment = await Payment.get(payment_id)
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
    
    update_data = payment_update.dict(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(payment, field, value)
    
    payment.updated_at = datetime.utcnow()
    await payment.save()
    
    return PaymentResponse(
        id=str(payment.id),
        event_id=payment.event_id,
        amount=payment.amount,
        payment_method=payment.payment_method,
        payment_type=payment.payment_type,
        payment_date=payment.payment_date,
        reference_number=payment.reference_number,
        receipt_number=payment.receipt_number,
        receipt=payment.receipt,
        bank_name=payment.bank_name,
        account_number=payment.account_number,
        transaction_id=payment.transaction_id,
        notes=payment.notes,
        is_verified=payment.is_verified,
        verified_by=payment.verified_by,
        verified_at=payment.verified_at,
        created_at=payment.created_at,
        updated_at=payment.updated_at
    )

@router.post("/{payment_id}/verify")
async def verify_payment(
    payment_id: str,
    current_user: User = Depends(require_admin_or_staff)
):
    """Verify a payment"""
    payment = await Payment.get(payment_id)
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
    
    payment.is_verified = True
    payment.verified_by = str(current_user.id)
    payment.verified_at = datetime.utcnow()
    payment.updated_at = datetime.utcnow()
    
    await payment.save()
    
    return {"message": "Payment verified successfully"}

@router.post("/{payment_id}/upload-receipt")
async def upload_receipt(
    payment_id: str,
    file: UploadFile = File(...),
    current_user: User = Depends(require_admin_or_staff)
):
    """Upload receipt for payment"""
    payment = await Payment.get(payment_id)
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
    
    # TODO: Implement file upload to cloud storage
    # For now, just update the payment with receipt info
    from models.payment import Receipt, ReceiptType
    
    receipt = Receipt(
        filename=file.filename,
        file_url=f"/uploads/receipts/{payment_id}_{file.filename}",
        file_type=ReceiptType.PDF if file.filename.endswith('.pdf') else ReceiptType.IMAGE,
        file_size=file.size if hasattr(file, 'size') else None
    )
    
    payment.receipt = receipt
    payment.updated_at = datetime.utcnow()
    await payment.save()
    
    return {"message": "Receipt uploaded successfully"}

@router.get("/stats/overview", response_model=PaymentStats)
async def get_payment_stats(current_user: User = Depends(get_current_user)):
    """Get payment statistics"""
    payments = await Payment.find_all().to_list()
    
    total_payments = len(payments)
    total_amount = sum(p.amount for p in payments)
    verified_payments = len([p for p in payments if p.is_verified])
    pending_verification = total_payments - verified_payments
    
    # Group by method and type
    by_method = {}
    by_type = {}
    
    for payment in payments:
        method = payment.payment_method
        ptype = payment.payment_type
        
        by_method[method] = by_method.get(method, 0) + 1
        by_type[ptype] = by_type.get(ptype, 0) + 1
    
    return PaymentStats(
        total_payments=total_payments,
        total_amount=total_amount,
        verified_payments=verified_payments,
        pending_verification=pending_verification,
        by_method=by_method,
        by_type=by_type
    )