from datetime import datetime
from typing import Optional, List
from beanie import Document

class Reminder(Document):
    title: str
    description: Optional[str] = None
    due_at: datetime
    recurring: bool = False
    recurrence_rule: Optional[str] = None

    assigned_to: Optional[str] = None
    related_event_id: Optional[str] = None

    is_done: bool = False
    completed_at: Optional[datetime] = None

    created_by: Optional[str] = None
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()

    def update_timestamp(self):
        self.updated_at = datetime.utcnow()

    class Settings:
        name = "reminders"
        use_state_management = True
        validate_on_save = True