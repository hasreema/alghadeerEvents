from datetime import datetime
from typing import Optional, List, Dict
from pydantic import Field, validator, EmailStr
from beanie import Indexed, Link

from app.models.base import BaseDocument
from app.models.enums import EventType, EventLocation, EventStatus, Gender, PaymentStatus


class EventPricing(BaseDocument):
    """Embedded document for event pricing details."""
    base_price: float = Field(ge=0)
    additional_services: Dict[str, float] = Field(default_factory=dict)
    discounts: float = Field(default=0, ge=0)
    taxes: float = Field(default=0, ge=0)
    total_price: float = Field(ge=0)
    
    @validator("total_price", pre=True, always=True)
    def calculate_total(cls, v, values):
        base = values.get("base_price", 0)
        services = sum(values.get("additional_services", {}).values())
        discounts = values.get("discounts", 0)
        taxes = values.get("taxes", 0)
        return base + services - discounts + taxes


class EventContact(BaseDocument):
    """Embedded document for event contact information."""
    name: str
    phone: str
    email: Optional[EmailStr] = None
    relation: Optional[str] = None  # bride, groom, parent, etc.
    is_primary: bool = False


class Event(BaseDocument):
    """Event model for managing hall events."""
    
    # Basic Information
    event_name: str
    event_type: EventType
    event_type_other: Optional[str] = None  # For custom event types
    location: EventLocation
    status: EventStatus = EventStatus.PENDING
    
    # Date and Time
    event_date: Indexed(datetime)
    start_time: str  # Format: "HH:MM"
    end_time: str    # Format: "HH:MM"
    setup_time: Optional[str] = None
    cleanup_time: Optional[str] = None
    
    # Guest Information
    expected_guests: int = Field(gt=0)
    actual_guests: Optional[int] = None
    guest_gender: Gender = Gender.MIXED
    
    # Contacts
    contacts: List[EventContact] = Field(default_factory=list)
    
    # Services and Additions
    services: Dict[str, bool] = Field(default_factory=dict)
    # Example: {"dj": true, "photography": true, "catering": false}
    
    special_requests: Optional[str] = None
    decoration_type: str = Field(default="standard")  # standard or custom
    decoration_details: Optional[str] = None
    
    # Menu and Catering
    menu_selections: Dict[str, List[str]] = Field(default_factory=dict)
    # Example: {"main": ["chicken", "beef"], "desserts": ["cake", "fruits"]}
    dietary_restrictions: List[str] = Field(default_factory=list)
    
    # Pricing and Payments
    pricing: EventPricing
    payment_status: PaymentStatus = PaymentStatus.PENDING
    deposit_amount: float = Field(default=0, ge=0)
    deposit_paid: bool = False
    outstanding_balance: float = Field(ge=0)
    
    # Staff Assignments
    assigned_employees: List[str] = Field(default_factory=list)  # Employee IDs
    labor_cost: float = Field(default=0, ge=0)
    
    # Financial Summary
    total_revenue: float = Field(ge=0)
    total_expenses: float = Field(default=0, ge=0)
    profit: float = Field(default=0)
    profit_margin: float = Field(default=0)  # Percentage
    
    # Notes and Documentation
    internal_notes: Optional[str] = None
    contract_url: Optional[str] = None
    
    # Integration IDs
    google_calendar_event_id: Optional[str] = None
    google_sheets_row_id: Optional[int] = None
    
    @validator("profit", pre=True, always=True)
    def calculate_profit(cls, v, values):
        revenue = values.get("total_revenue", 0)
        expenses = values.get("total_expenses", 0)
        return revenue - expenses
    
    @validator("profit_margin", pre=True, always=True)
    def calculate_profit_margin(cls, v, values):
        revenue = values.get("total_revenue", 0)
        profit = values.get("profit", 0)
        if revenue > 0:
            return (profit / revenue) * 100
        return 0
    
    @validator("outstanding_balance", pre=True, always=True)
    def calculate_outstanding(cls, v, values):
        pricing = values.get("pricing")
        if pricing:
            total = pricing.total_price
            deposit = values.get("deposit_amount", 0) if values.get("deposit_paid") else 0
            return total - deposit
        return 0
    
    class Settings:
        name = "events"
        indexes = [
            "event_date",
            "event_type",
            "location",
            "status",
            "payment_status"
        ]
    
    class Config:
        schema_extra = {
            "example": {
                "event_name": "Sarah & John Wedding",
                "event_type": "wedding",
                "location": "hall_floor_1",
                "event_date": "2024-06-15T00:00:00",
                "start_time": "19:00",
                "end_time": "23:00",
                "expected_guests": 250,
                "guest_gender": "mixed",
                "services": {
                    "dj": True,
                    "photography": True,
                    "videography": True
                },
                "pricing": {
                    "base_price": 15000,
                    "additional_services": {
                        "dj": 1500,
                        "photography": 2500
                    },
                    "total_price": 19000
                }
            }
        }