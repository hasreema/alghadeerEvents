from datetime import datetime
from typing import Optional, List
from pydantic import Field, validator
from beanie import Indexed, Link

from app.models.base import BaseDocument
from app.models.enums import PaymentStatus, PaymentMethod


class Payment(BaseDocument):
    """Payment model for tracking event payments."""
    
    # Event Reference
    event_id: Indexed(str)  # Reference to Event
    event_name: str  # Denormalized for quick access
    
    # Payment Details
    amount: float = Field(gt=0)
    payment_method: PaymentMethod
    payment_date: Indexed(datetime)
    payment_status: PaymentStatus = PaymentStatus.PENDING
    
    # Transaction Details
    transaction_id: Optional[str] = None
    reference_number: Optional[str] = None
    
    # Receipt Information
    receipt_url: Optional[str] = None  # URL to uploaded receipt
    receipt_number: Optional[str] = None
    
    # Payer Information
    payer_name: str
    payer_phone: Optional[str] = None
    payer_email: Optional[str] = None
    
    # Additional Details
    description: Optional[str] = None
    notes: Optional[str] = None
    
    # Refund Information (if applicable)
    is_refunded: bool = False
    refund_amount: Optional[float] = None
    refund_date: Optional[datetime] = None
    refund_reason: Optional[str] = None
    
    # Verification
    is_verified: bool = False
    verified_by: Optional[str] = None  # User ID
    verified_at: Optional[datetime] = None
    
    # Integration
    google_sheets_row_id: Optional[int] = None
    
    @validator("refund_amount")
    def validate_refund_amount(cls, v, values):
        if v is not None:
            amount = values.get("amount", 0)
            if v > amount:
                raise ValueError("Refund amount cannot exceed payment amount")
        return v
    
    class Settings:
        name = "payments"
        indexes = [
            "event_id",
            "payment_date",
            "payment_status",
            "payment_method",
            "is_verified"
        ]
    
    class Config:
        schema_extra = {
            "example": {
                "event_id": "60d5f483f8cf1c1a8c0e9d80",
                "event_name": "Sarah & John Wedding",
                "amount": 5000,
                "payment_method": "bank_transfer",
                "payment_date": "2024-05-01T10:00:00",
                "payment_status": "paid",
                "payer_name": "John Smith",
                "payer_phone": "+970591234567",
                "description": "Deposit payment for wedding",
                "is_verified": True
            }
        }