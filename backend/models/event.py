from beanie import Document, Link
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, date
from enum import Enum
from decimal import Decimal
from bson import ObjectId

class EventType(str, Enum):
    WEDDING = "wedding"
    HENNA = "henna"
    ENGAGEMENT = "engagement"
    GRADUATION = "graduation"
    BIRTHDAY = "birthday"
    CORPORATE = "corporate"
    OTHER = "other"

class EventStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class PaymentStatus(str, Enum):
    NOT_PAID = "not_paid"
    PARTIALLY_PAID = "partially_paid"
    PAID = "paid"
    OVERDUE = "overdue"

class Venue(str, Enum):
    HALL_A = "hall_a"
    HALL_B = "hall_b"
    GARDEN = "garden"
    ROOFTOP = "rooftop"

class ServiceAddon(BaseModel):
    name: str
    price: Decimal
    quantity: int = 1
    notes: Optional[str] = None

class ContactInfo(BaseModel):
    client_name: str
    phone: str
    email: Optional[str] = None
    address: Optional[str] = None

class Event(Document):
    # Basic Information
    title: str = Field(..., description="Event title")
    event_type: EventType = Field(..., description="Type of event")
    status: EventStatus = Field(default=EventStatus.PENDING)
    
    # Contact & Client Info
    contact: ContactInfo = Field(..., description="Client contact information")
    
    # Date & Time
    event_date: date = Field(..., description="Event date")
    start_time: datetime = Field(..., description="Event start time")
    end_time: datetime = Field(..., description="Event end time")
    setup_time: Optional[datetime] = None
    
    # Venue & Capacity
    venue: Venue = Field(..., description="Event venue")
    guest_count: int = Field(..., ge=1, description="Number of guests")
    max_capacity: Optional[int] = None
    
    # Financial Information
    base_price: Decimal = Field(..., description="Base hall rental price")
    service_addons: List[ServiceAddon] = Field(default_factory=list)
    total_price: Decimal = Field(..., description="Total event price")
    amount_paid: Decimal = Field(default=Decimal("0.00"))
    payment_status: PaymentStatus = Field(default=PaymentStatus.NOT_PAID)
    
    # Staff & Employees
    assigned_employees: List[str] = Field(default_factory=list, description="Employee IDs assigned to event")
    labor_cost: Decimal = Field(default=Decimal("0.00"))
    
    # Additional Information
    notes: Optional[str] = None
    special_requirements: List[str] = Field(default_factory=list)
    equipment_needed: List[str] = Field(default_factory=list)
    
    # Profitability Analysis
    total_expenses: Decimal = Field(default=Decimal("0.00"))
    profit_margin: Optional[Decimal] = None
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: Optional[str] = None  # User ID
    
    # Integration
    google_calendar_event_id: Optional[str] = None
    sheets_row_id: Optional[int] = None
    
    class Settings:
        name = "events"
        indexes = [
            "event_date",
            "status",
            "venue",
            "event_type",
            "payment_status",
            "contact.client_name",
            "created_at"
        ]
    
    def calculate_total_price(self) -> Decimal:
        """Calculate total price including addons"""
        addon_total = sum(addon.price * addon.quantity for addon in self.service_addons)
        return self.base_price + addon_total
    
    def calculate_profit(self) -> Decimal:
        """Calculate profit/loss for the event"""
        total_revenue = self.amount_paid
        total_costs = self.total_expenses + self.labor_cost
        return total_revenue - total_costs
    
    def get_outstanding_balance(self) -> Decimal:
        """Get remaining balance to be paid"""
        return self.total_price - self.amount_paid

class EventCreate(BaseModel):
    title: str
    event_type: EventType
    contact: ContactInfo
    event_date: date
    start_time: datetime
    end_time: datetime
    venue: Venue
    guest_count: int
    base_price: Decimal
    service_addons: List[ServiceAddon] = []
    notes: Optional[str] = None
    special_requirements: List[str] = []
    equipment_needed: List[str] = []

class EventUpdate(BaseModel):
    title: Optional[str] = None
    event_type: Optional[EventType] = None
    status: Optional[EventStatus] = None
    contact: Optional[ContactInfo] = None
    event_date: Optional[date] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    venue: Optional[Venue] = None
    guest_count: Optional[int] = None
    base_price: Optional[Decimal] = None
    service_addons: Optional[List[ServiceAddon]] = None
    assigned_employees: Optional[List[str]] = None
    notes: Optional[str] = None
    special_requirements: Optional[List[str]] = None
    equipment_needed: Optional[List[str]] = None

class EventResponse(BaseModel):
    id: str
    title: str
    event_type: EventType
    status: EventStatus
    contact: ContactInfo
    event_date: date
    start_time: datetime
    end_time: datetime
    venue: Venue
    guest_count: int
    base_price: Decimal
    service_addons: List[ServiceAddon]
    total_price: Decimal
    amount_paid: Decimal
    payment_status: PaymentStatus
    assigned_employees: List[str]
    labor_cost: Decimal
    notes: Optional[str]
    special_requirements: List[str]
    equipment_needed: List[str]
    profit_margin: Optional[Decimal]
    created_at: datetime
    updated_at: datetime

class EventStats(BaseModel):
    total_events: int
    confirmed_events: int
    completed_events: int
    total_revenue: Decimal
    total_profit: Decimal
    upcoming_events: int
    overdue_payments: int