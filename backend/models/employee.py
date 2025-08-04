from beanie import Document
from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime
from enum import Enum
from decimal import Decimal
from bson import ObjectId

class EmployeeRole(str, Enum):
    MANAGER = "manager"
    WAITER = "waiter"
    CHEF = "chef"
    CLEANER = "cleaner"
    SECURITY = "security"
    DJ = "dj"
    DECORATOR = "decorator"
    PHOTOGRAPHER = "photographer"
    COORDINATOR = "coordinator"

class EmployeeStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    ON_LEAVE = "on_leave"
    TERMINATED = "terminated"

class PaymentStatus(str, Enum):
    PENDING = "pending"
    PAID = "paid"
    OVERDUE = "overdue"

class WorkShift(BaseModel):
    event_id: str
    start_time: datetime
    end_time: datetime
    hours_worked: Decimal
    hourly_rate: Decimal
    total_payment: Decimal
    payment_status: PaymentStatus = PaymentStatus.PENDING
    notes: Optional[str] = None

class Employee(Document):
    # Basic Information
    full_name: str = Field(..., description="Employee full name")
    phone: str = Field(..., description="Phone number")
    email: Optional[EmailStr] = None
    address: Optional[str] = None
    
    # Employment Details
    employee_id: Optional[str] = None
    role: EmployeeRole = Field(..., description="Employee role")
    status: EmployeeStatus = Field(default=EmployeeStatus.ACTIVE)
    hire_date: datetime = Field(default_factory=datetime.utcnow)
    
    # Payment Information
    hourly_rate: Decimal = Field(..., gt=0, description="Hourly wage rate")
    overtime_rate: Optional[Decimal] = None
    
    # Work History
    work_shifts: List[WorkShift] = Field(default_factory=list)
    total_hours_worked: Decimal = Field(default=Decimal("0.00"))
    total_earnings: Decimal = Field(default=Decimal("0.00"))
    pending_payments: Decimal = Field(default=Decimal("0.00"))
    
    # Skills & Certifications
    skills: List[str] = Field(default_factory=list)
    certifications: List[str] = Field(default_factory=list)
    languages: List[str] = Field(default_factory=list)
    
    # Emergency Contact
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    
    # Performance & Notes
    rating: Optional[float] = Field(None, ge=1, le=5)
    notes: Optional[str] = None
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: Optional[str] = None  # User ID
    
    # Integration
    sheets_row_id: Optional[int] = None
    
    class Settings:
        name = "employees"
        indexes = [
            "employee_id",
            "role",
            "status",
            "phone",
            "email",
            "created_at"
        ]
    
    def calculate_total_earnings(self) -> Decimal:
        """Calculate total earnings from all shifts"""
        return sum(shift.total_payment for shift in self.work_shifts)
    
    def calculate_pending_payments(self) -> Decimal:
        """Calculate pending payments"""
        return sum(
            shift.total_payment 
            for shift in self.work_shifts 
            if shift.payment_status == PaymentStatus.PENDING
        )

class EmployeeCreate(BaseModel):
    full_name: str
    phone: str
    email: Optional[EmailStr] = None
    address: Optional[str] = None
    employee_id: Optional[str] = None
    role: EmployeeRole
    hourly_rate: Decimal
    overtime_rate: Optional[Decimal] = None
    skills: List[str] = []
    certifications: List[str] = []
    languages: List[str] = []
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    notes: Optional[str] = None

class EmployeeUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    address: Optional[str] = None
    employee_id: Optional[str] = None
    role: Optional[EmployeeRole] = None
    status: Optional[EmployeeStatus] = None
    hourly_rate: Optional[Decimal] = None
    overtime_rate: Optional[Decimal] = None
    skills: Optional[List[str]] = None
    certifications: Optional[List[str]] = None
    languages: Optional[List[str]] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    rating: Optional[float] = None
    notes: Optional[str] = None

class EmployeeResponse(BaseModel):
    id: str
    full_name: str
    phone: str
    email: Optional[str]
    address: Optional[str]
    employee_id: Optional[str]
    role: EmployeeRole
    status: EmployeeStatus
    hire_date: datetime
    hourly_rate: Decimal
    overtime_rate: Optional[Decimal]
    total_hours_worked: Decimal
    total_earnings: Decimal
    pending_payments: Decimal
    skills: List[str]
    certifications: List[str]
    languages: List[str]
    emergency_contact_name: Optional[str]
    emergency_contact_phone: Optional[str]
    rating: Optional[float]
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime

class WorkShiftCreate(BaseModel):
    employee_id: str
    event_id: str
    start_time: datetime
    end_time: datetime
    hourly_rate: Optional[Decimal] = None  # Will use employee's default if not provided
    notes: Optional[str] = None

class EmployeeStats(BaseModel):
    total_employees: int
    active_employees: int
    total_hours_this_month: Decimal
    total_wages_pending: Decimal
    by_role: dict
    top_performers: List[dict]