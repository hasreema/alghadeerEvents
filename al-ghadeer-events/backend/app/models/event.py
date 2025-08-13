from datetime import datetime
from typing import List, Optional, Dict
from beanie import Document
from pydantic import BaseModel

class EventContact(BaseModel):
    name: str
    phone: str
    email: Optional[str] = None
    relation: Optional[str] = None
    is_primary: bool = False

class EventPricing(BaseModel):
    base_price: float = 0
    additional_services: Dict[str, float] = {}
    discounts: float = 0
    taxes: float = 0
    total_price: float = 0

class EventEmployeeAssignment(BaseModel):
    employee_id: str
    role: Optional[str] = None
    hours: Optional[float] = None
    cost: Optional[float] = None

class Event(Document):
    event_name: str
    event_type: str
    event_type_other: Optional[str] = None
    location: str
    status: str = "pending"
    event_date: datetime
    start_time: str
    end_time: str

    expected_guests: int
    actual_guests: Optional[int] = None
    guest_gender: str = "mixed"

    contacts: List[EventContact] = []
    services: Dict[str, bool] = {}
    special_requests: Optional[str] = None
    decoration_type: str = "standard"
    decoration_details: Optional[str] = None
    menu_selections: Dict[str, List[str]] = {}
    dietary_restrictions: List[str] = []

    pricing: EventPricing
    deposit_amount: float = 0
    deposit_paid: bool = False

    assigned_employees: List[str] = []
    assignments: List[EventEmployeeAssignment] = []
    labor_cost: float = 0

    total_revenue: float = 0
    total_expenses: float = 0
    profit: float = 0
    profit_margin: float = 0

    created_by: Optional[str] = None
    updated_by: Optional[str] = None
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()

    @property
    def outstanding_balance(self) -> float:
        return max(0.0, (self.pricing.total_price or 0) - (self.deposit_amount or 0))

    def update_timestamp(self, by_user_id: Optional[str] = None):
        self.updated_at = datetime.utcnow()
        if by_user_id:
            self.updated_by = by_user_id

    class Settings:
        name = "events"
        use_state_management = True
        validate_on_save = True