from datetime import datetime, timedelta
from typing import Optional, List
from pydantic import Field, validator
from beanie import Indexed
from croniter import croniter

from app.models.base import BaseDocument
from app.models.enums import ReminderType, ReminderFrequency


class Reminder(BaseDocument):
    """Reminder model for managing event and general reminders."""
    
    # Reminder Information
    title: str
    description: Optional[str] = None
    reminder_type: ReminderType = ReminderType.ONE_TIME
    
    # Event Reference (optional)
    event_id: Optional[Indexed(str)] = None
    event_name: Optional[str] = None
    
    # Task Reference (optional)
    task_id: Optional[str] = None
    task_title: Optional[str] = None
    
    # Timing
    reminder_date: Indexed(datetime)
    
    # Recurring Settings
    frequency: Optional[ReminderFrequency] = None
    recurring_pattern: Optional[str] = None  # Cron expression for complex patterns
    recurring_end_date: Optional[datetime] = None
    recurring_count: Optional[int] = None  # Number of times to repeat
    
    # Recipients
    assigned_to: List[str] = Field(default_factory=list)  # User IDs
    assigned_to_names: List[str] = Field(default_factory=list)  # Denormalized
    
    # Notification Settings
    send_email: bool = True
    send_whatsapp: bool = False
    send_push: bool = True
    
    # Status
    is_active: bool = True
    is_completed: bool = False
    completed_date: Optional[datetime] = None
    
    # Execution History
    last_sent_date: Optional[datetime] = None
    send_count: int = Field(default=0)
    next_reminder_date: Optional[datetime] = None
    
    # Custom Message
    custom_message: Optional[str] = None
    
    # Integration
    google_calendar_event_id: Optional[str] = None
    google_sheets_row_id: Optional[int] = None
    
    @validator("recurring_pattern")
    def validate_cron_pattern(cls, v):
        if v:
            try:
                croniter(v)
            except:
                raise ValueError("Invalid cron pattern")
        return v
    
    def calculate_next_reminder(self) -> Optional[datetime]:
        """Calculate the next reminder date for recurring reminders."""
        if self.reminder_type == ReminderType.ONE_TIME:
            return None
            
        if self.recurring_pattern:
            # Use cron pattern
            cron = croniter(self.recurring_pattern, self.reminder_date)
            next_date = cron.get_next(datetime)
        elif self.frequency:
            # Use simple frequency
            if self.frequency == ReminderFrequency.DAILY:
                delta = timedelta(days=1)
            elif self.frequency == ReminderFrequency.WEEKLY:
                delta = timedelta(weeks=1)
            elif self.frequency == ReminderFrequency.MONTHLY:
                delta = timedelta(days=30)  # Approximate
            elif self.frequency == ReminderFrequency.YEARLY:
                delta = timedelta(days=365)  # Approximate
            else:
                return None
                
            next_date = (self.last_sent_date or self.reminder_date) + delta
        else:
            return None
            
        # Check end conditions
        if self.recurring_end_date and next_date > self.recurring_end_date:
            return None
        if self.recurring_count and self.send_count >= self.recurring_count:
            return None
            
        return next_date
    
    def should_send_now(self) -> bool:
        """Check if reminder should be sent now."""
        if not self.is_active or self.is_completed:
            return False
            
        now = datetime.utcnow()
        
        if self.reminder_type == ReminderType.ONE_TIME:
            return now >= self.reminder_date and not self.last_sent_date
        else:
            # Recurring reminder
            if self.next_reminder_date:
                return now >= self.next_reminder_date
            else:
                return now >= self.reminder_date and not self.last_sent_date
    
    class Settings:
        name = "reminders"
        indexes = [
            "event_id",
            "task_id",
            "reminder_date",
            "is_active",
            "reminder_type"
        ]
    
    class Config:
        schema_extra = {
            "example": {
                "title": "Wedding preparation reminder",
                "description": "Remind to check all preparations 2 days before wedding",
                "reminder_type": "one_time",
                "event_id": "60d5f483f8cf1c1a8c0e9d81",
                "event_name": "Sarah & John Wedding",
                "reminder_date": "2024-06-13T10:00:00",
                "assigned_to": ["60d5f483f8cf1c1a8c0e9d80"],
                "send_email": True,
                "send_push": True,
                "is_active": True
            }
        }