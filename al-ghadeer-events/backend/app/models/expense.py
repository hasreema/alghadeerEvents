from datetime import datetime
from typing import Optional
from beanie import Document

class Expense(Document):
    event_id: Optional[str] = None
    category: str
    description: Optional[str] = None
    amount: float
    currency: str = "ILS"
    expense_date: datetime
    created_by: Optional[str] = None
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()

    def update_timestamp(self):
        self.updated_at = datetime.utcnow()

    class Settings:
        name = "expenses"
        use_state_management = True
        validate_on_save = True