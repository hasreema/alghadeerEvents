from datetime import datetime
from typing import Optional, List
from pydantic import Field
from beanie import Indexed

from app.models.base import BaseDocument
from app.models.enums import ExpenseCategory, PaymentMethod


class Expense(BaseDocument):
    """Expense model for tracking event and operational expenses."""
    
    # Expense Information
    expense_name: str
    description: Optional[str] = None
    amount: float = Field(gt=0)
    category: ExpenseCategory
    category_other: Optional[str] = None  # For OTHER category
    
    # Event Reference (optional - for event-specific expenses)
    event_id: Optional[Indexed(str)] = None
    event_name: Optional[str] = None
    
    # Date and Payment
    expense_date: Indexed(datetime)
    payment_method: PaymentMethod = PaymentMethod.CASH
    payment_date: Optional[datetime] = None
    
    # Vendor Information
    vendor_name: Optional[str] = None
    vendor_phone: Optional[str] = None
    vendor_email: Optional[str] = None
    vendor_tax_id: Optional[str] = None
    
    # Receipt and Documentation
    receipt_url: Optional[str] = None
    receipt_number: Optional[str] = None
    invoice_number: Optional[str] = None
    
    # Approval and Verification
    is_approved: bool = False
    approved_by: Optional[str] = None  # User ID
    approved_date: Optional[datetime] = None
    approval_notes: Optional[str] = None
    
    # Recurring Expense
    is_recurring: bool = False
    recurring_frequency: Optional[str] = None  # monthly, quarterly, yearly
    next_due_date: Optional[datetime] = None
    
    # Budget Tracking
    budget_category: Optional[str] = None
    budget_allocated: Optional[float] = Field(ge=0, default=None)
    
    # Employee Reference (for reimbursements)
    employee_id: Optional[str] = None
    employee_name: Optional[str] = None
    is_reimbursement: bool = False
    reimbursement_status: Optional[str] = None  # pending, approved, paid
    
    # Tags and Notes
    tags: List[str] = Field(default_factory=list)
    internal_notes: Optional[str] = None
    
    # Integration
    google_sheets_row_id: Optional[int] = None
    
    def is_over_budget(self) -> bool:
        """Check if expense is over allocated budget."""
        if self.budget_allocated:
            return self.amount > self.budget_allocated
        return False
    
    class Settings:
        name = "expenses"
        indexes = [
            "event_id",
            "expense_date",
            "category",
            "vendor_name",
            "is_approved"
        ]
    
    class Config:
        schema_extra = {
            "example": {
                "expense_name": "Wedding Flowers",
                "description": "Floral arrangements for Sarah & John wedding",
                "amount": 1500,
                "category": "decoration",
                "event_id": "60d5f483f8cf1c1a8c0e9d81",
                "event_name": "Sarah & John Wedding",
                "expense_date": "2024-06-10T00:00:00",
                "payment_method": "bank_transfer",
                "vendor_name": "Bloom Flowers LLC",
                "vendor_phone": "+970591234567",
                "receipt_number": "INV-2024-001",
                "is_approved": True
            }
        }