from datetime import datetime
from typing import Optional, List, Dict
from pydantic import BaseModel, EmailStr, Field, validator

# Auth Schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: str
    phone_number: Optional[str] = None
    preferred_language: str = "en"
    department: Optional[str] = None


class UserCreate(UserBase):
    password: str = Field(..., min_length=8)
    role: str = "staff"


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    preferred_language: Optional[str] = None
    department: Optional[str] = None
    email_notifications: Optional[bool] = None
    whatsapp_notifications: Optional[bool] = None
    push_notifications: Optional[bool] = None


class UserResponse(UserBase):
    id: str
    role: str
    is_active: bool
    is_verified: bool
    email_notifications: bool
    whatsapp_notifications: bool
    push_notifications: bool
    avatar_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8)


# Event Schemas
class EventContactSchema(BaseModel):
    name: str
    phone: str
    email: Optional[EmailStr] = None
    relation: Optional[str] = None
    is_primary: bool = False


class EventPricingSchema(BaseModel):
    base_price: float = Field(ge=0)
    additional_services: Dict[str, float] = Field(default_factory=dict)
    discounts: float = Field(default=0, ge=0)
    taxes: float = Field(default=0, ge=0)
    total_price: float = Field(ge=0)


class EventCreate(BaseModel):
    event_name: str
    event_type: str
    event_type_other: Optional[str] = None
    location: str
    event_date: datetime
    start_time: str
    end_time: str
    setup_time: Optional[str] = None
    cleanup_time: Optional[str] = None
    expected_guests: int = Field(gt=0)
    guest_gender: str = "mixed"
    contacts: List[EventContactSchema]
    services: Dict[str, bool] = Field(default_factory=dict)
    special_requests: Optional[str] = None
    decoration_type: str = "standard"
    decoration_details: Optional[str] = None
    menu_selections: Dict[str, List[str]] = Field(default_factory=dict)
    dietary_restrictions: List[str] = Field(default_factory=list)
    pricing: EventPricingSchema
    deposit_amount: float = Field(default=0, ge=0)
    internal_notes: Optional[str] = None


class EventUpdate(BaseModel):
    event_name: Optional[str] = None
    event_type: Optional[str] = None
    location: Optional[str] = None
    status: Optional[str] = None
    event_date: Optional[datetime] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    expected_guests: Optional[int] = None
    actual_guests: Optional[int] = None
    services: Optional[Dict[str, bool]] = None
    special_requests: Optional[str] = None
    internal_notes: Optional[str] = None
    assigned_employees: Optional[List[str]] = None


class EventResponse(BaseModel):
    id: str
    event_name: str
    event_type: str
    event_type_other: Optional[str]
    location: str
    status: str
    event_date: datetime
    start_time: str
    end_time: str
    expected_guests: int
    actual_guests: Optional[int]
    guest_gender: str
    contacts: List[EventContactSchema]
    services: Dict[str, bool]
    pricing: EventPricingSchema
    payment_status: str
    deposit_amount: float
    deposit_paid: bool
    outstanding_balance: float
    assigned_employees: List[str]
    labor_cost: float
    total_revenue: float
    total_expenses: float
    profit: float
    profit_margin: float
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Payment Schemas
class PaymentCreate(BaseModel):
    event_id: str
    amount: float = Field(gt=0)
    payment_method: str
    payment_date: datetime
    payer_name: str
    payer_phone: Optional[str] = None
    payer_email: Optional[EmailStr] = None
    description: Optional[str] = None
    notes: Optional[str] = None
    transaction_id: Optional[str] = None
    reference_number: Optional[str] = None


class PaymentUpdate(BaseModel):
    payment_status: Optional[str] = None
    notes: Optional[str] = None
    is_verified: Optional[bool] = None


class PaymentResponse(BaseModel):
    id: str
    event_id: str
    event_name: str
    amount: float
    payment_method: str
    payment_date: datetime
    payment_status: str
    payer_name: str
    payer_phone: Optional[str]
    payer_email: Optional[str]
    description: Optional[str]
    notes: Optional[str]
    receipt_url: Optional[str]
    is_verified: bool
    verified_by: Optional[str]
    verified_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Employee Schemas
class EmployeeCreate(BaseModel):
    employee_id: str
    full_name: str
    email: Optional[EmailStr] = None
    phone_number: str
    address: Optional[str] = None
    position: str
    department: Optional[str] = None
    hire_date: datetime
    hourly_rate: float = Field(ge=0)
    monthly_salary: Optional[float] = Field(ge=0, default=None)
    payment_method: str = "bank_transfer"
    bank_account: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    emergency_contact_relation: Optional[str] = None
    id_number: Optional[str] = None


class EmployeeUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone_number: Optional[str] = None
    address: Optional[str] = None
    position: Optional[str] = None
    department: Optional[str] = None
    hourly_rate: Optional[float] = None
    monthly_salary: Optional[float] = None
    is_active: Optional[bool] = None
    notes: Optional[str] = None


class EmployeeResponse(BaseModel):
    id: str
    employee_id: str
    full_name: str
    email: Optional[str]
    phone_number: str
    position: str
    department: Optional[str]
    hire_date: datetime
    is_active: bool
    hourly_rate: float
    monthly_salary: Optional[float]
    total_events_worked: int
    rating: Optional[float]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Task Schemas
class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    priority: str = "medium"
    assigned_to: Optional[str] = None
    event_id: Optional[str] = None
    due_date: Optional[datetime] = None
    tags: List[str] = Field(default_factory=list)
    category: Optional[str] = None
    reminder_enabled: bool = False
    reminder_before_hours: int = 24


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    assigned_to: Optional[str] = None
    due_date: Optional[datetime] = None
    progress_percentage: Optional[int] = Field(None, ge=0, le=100)


class TaskResponse(BaseModel):
    id: str
    title: str
    description: Optional[str]
    status: str
    priority: str
    assigned_to: Optional[str]
    assigned_to_name: Optional[str]
    event_id: Optional[str]
    event_name: Optional[str]
    due_date: Optional[datetime]
    progress_percentage: int
    tags: List[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Common Schemas
class PaginatedResponse(BaseModel):
    items: List
    total: int
    page: int
    page_size: int
    total_pages: int


class MessageResponse(BaseModel):
    message: str
    details: Optional[Dict] = None


class FileUploadResponse(BaseModel):
    filename: str
    url: str
    size: int
    content_type: str