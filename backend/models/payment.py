from beanie import Document, Link
from pydantic import BaseModel, Field, HttpUrl
from typing import Optional, List
from datetime import datetime
from enum import Enum
from decimal import Decimal
from bson import ObjectId

class PaymentMethod(str, Enum):
    CASH = "cash"
    BANK_TRANSFER = "bank_transfer"
    CREDIT_CARD = "credit_card"
    CHECK = "check"
    OTHER = "other"

class PaymentType(str, Enum):
    DEPOSIT = "deposit"
    PARTIAL = "partial"
    FINAL = "final"
    REFUND = "refund"

class ReceiptType(str, Enum):
    IMAGE = "image"
    PDF = "pdf"
    SCAN = "scan"

class Receipt(BaseModel):
    filename: str
    file_url: str
    file_type: ReceiptType
    file_size: Optional[int] = None
    upload_date: datetime = Field(default_factory=datetime.utcnow)

class Payment(Document):
    # Event Reference
    event_id: str = Field(..., description="Reference to event")
    
    # Payment Details
    amount: Decimal = Field(..., gt=0, description="Payment amount")
    payment_method: PaymentMethod = Field(..., description="Method of payment")
    payment_type: PaymentType = Field(..., description="Type of payment")
    
    # Date & Reference
    payment_date: datetime = Field(..., description="Date payment was made")
    reference_number: Optional[str] = None
    receipt_number: Optional[str] = None
    
    # Receipt & Documentation
    receipt: Optional[Receipt] = None
    notes: Optional[str] = None
    
    # Bank/Transfer Details
    bank_name: Optional[str] = None
    account_number: Optional[str] = None
    transaction_id: Optional[str] = None
    
    # Status & Verification
    is_verified: bool = Field(default=False)
    verified_by: Optional[str] = None  # User ID
    verified_at: Optional[datetime] = None
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: Optional[str] = None  # User ID
    
    # Integration
    sheets_row_id: Optional[int] = None
    
    class Settings:
        name = "payments"
        indexes = [
            "event_id",
            "payment_date",
            "payment_method",
            "payment_type",
            "is_verified",
            "created_at"
        ]

class PaymentCreate(BaseModel):
    event_id: str
    amount: Decimal
    payment_method: PaymentMethod
    payment_type: PaymentType
    payment_date: datetime
    reference_number: Optional[str] = None
    receipt_number: Optional[str] = None
    bank_name: Optional[str] = None
    account_number: Optional[str] = None
    transaction_id: Optional[str] = None
    notes: Optional[str] = None

class PaymentUpdate(BaseModel):
    amount: Optional[Decimal] = None
    payment_method: Optional[PaymentMethod] = None
    payment_type: Optional[PaymentType] = None
    payment_date: Optional[datetime] = None
    reference_number: Optional[str] = None
    receipt_number: Optional[str] = None
    bank_name: Optional[str] = None
    account_number: Optional[str] = None
    transaction_id: Optional[str] = None
    notes: Optional[str] = None
    is_verified: Optional[bool] = None

class PaymentResponse(BaseModel):
    id: str
    event_id: str
    amount: Decimal
    payment_method: PaymentMethod
    payment_type: PaymentType
    payment_date: datetime
    reference_number: Optional[str]
    receipt_number: Optional[str]
    receipt: Optional[Receipt]
    bank_name: Optional[str]
    account_number: Optional[str]
    transaction_id: Optional[str]
    notes: Optional[str]
    is_verified: bool
    verified_by: Optional[str]
    verified_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

class PaymentStats(BaseModel):
    total_payments: int
    total_amount: Decimal
    verified_payments: int
    pending_verification: int
    by_method: dict
    by_type: dict