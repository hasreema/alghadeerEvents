from datetime import datetime
from typing import Optional, Dict
from beanie import Document
from pydantic import EmailStr
from app.models.enums import CompensationType

class Employee(Document):
    employee_id: str
    full_name: str
    email: Optional[EmailStr] = None
    phone_number: str
    address: Optional[str] = None
    position: str
    department: Optional[str] = None
    hire_date: datetime

    compensation_type: CompensationType = CompensationType.HOURLY
    hourly_rate: float = 0.0
    role_rate_map: Dict[str, float] = {}

    payment_method: str = "bank_transfer"

    is_active: bool = True
    notes: Optional[str] = None

    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()

    def update_timestamp(self):
        self.updated_at = datetime.utcnow()

    class Settings:
        name = "employees"
        use_state_management = True
        validate_on_save = True