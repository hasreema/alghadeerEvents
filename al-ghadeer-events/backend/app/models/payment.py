from datetime import datetime
from typing import Optional
from beanie import Document
from pydantic import BaseModel

class Payment(Document):
    event_id: str
    event_name: str

    amount: float
    payment_method: str
    payment_date: datetime
    payment_status: str = "pending"

    payer_name: str
    payer_phone: Optional[str] = None
    payer_email: Optional[str] = None
    description: Optional[str] = None
    notes: Optional[str] = None

    receipt_url: Optional[str] = None
    is_verified: bool = False
    verified_by: Optional[str] = None
    verified_at: Optional[datetime] = None

    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()

    def update_timestamp(self, _by: Optional[str] = None):
        self.updated_at = datetime.utcnow()

    class Settings:
        name = "payments"
        use_state_management = True
        validate_on_save = True