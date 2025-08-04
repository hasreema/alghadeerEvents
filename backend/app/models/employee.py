from datetime import datetime
from typing import Optional, List, Dict
from pydantic import Field, EmailStr
from beanie import Indexed

from app.models.base import BaseDocument


class EmployeeSchedule(BaseDocument):
    """Embedded document for employee schedule."""
    event_id: str
    event_name: str
    event_date: datetime
    start_time: str
    end_time: str
    hours_worked: float = Field(ge=0)
    hourly_rate: float = Field(ge=0)
    total_payment: float = Field(ge=0)
    is_paid: bool = False
    paid_date: Optional[datetime] = None


class Employee(BaseDocument):
    """Employee model for staff management."""
    
    # Personal Information
    employee_id: Indexed(str, unique=True)  # Internal ID
    full_name: str
    email: Optional[EmailStr] = None
    phone_number: str
    address: Optional[str] = None
    
    # Employment Details
    position: str  # e.g., Waiter, Chef, Coordinator, Security
    department: Optional[str] = None
    hire_date: datetime
    is_active: bool = True
    
    # Payment Information
    hourly_rate: float = Field(ge=0)
    monthly_salary: Optional[float] = Field(ge=0, default=None)
    payment_method: str = "bank_transfer"
    bank_account: Optional[str] = None
    
    # Work Schedule
    default_availability: Dict[str, List[str]] = Field(default_factory=dict)
    # Example: {"monday": ["09:00-17:00"], "tuesday": ["09:00-17:00"]}
    
    # Event Assignments
    assigned_events: List[EmployeeSchedule] = Field(default_factory=list)
    total_events_worked: int = Field(default=0)
    
    # Performance
    rating: Optional[float] = Field(ge=0, le=5, default=None)
    notes: Optional[str] = None
    
    # Emergency Contact
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    emergency_contact_relation: Optional[str] = None
    
    # Documents
    id_number: Optional[str] = None
    documents: List[str] = Field(default_factory=list)  # URLs to uploaded documents
    
    # Integration
    google_sheets_row_id: Optional[int] = None
    
    def calculate_total_earnings(self, start_date: Optional[datetime] = None, 
                               end_date: Optional[datetime] = None) -> float:
        """Calculate total earnings for a period."""
        total = 0
        for assignment in self.assigned_events:
            if start_date and assignment.event_date < start_date:
                continue
            if end_date and assignment.event_date > end_date:
                continue
            total += assignment.total_payment
        return total
    
    def get_unpaid_amount(self) -> float:
        """Get total unpaid amount."""
        return sum(
            assignment.total_payment 
            for assignment in self.assigned_events 
            if not assignment.is_paid
        )
    
    class Settings:
        name = "employees"
        indexes = [
            "employee_id",
            "full_name",
            "position",
            "is_active",
            "email"
        ]
    
    class Config:
        schema_extra = {
            "example": {
                "employee_id": "EMP001",
                "full_name": "Ahmed Hassan",
                "email": "ahmed@alghadeer-events.com",
                "phone_number": "+970591234567",
                "position": "Event Coordinator",
                "department": "Operations",
                "hire_date": "2023-01-15T00:00:00",
                "hourly_rate": 50,
                "is_active": True
            }
        }