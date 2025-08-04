from beanie import Document
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum
from bson import ObjectId

class ReminderType(str, Enum):
    EVENT = "event"
    PAYMENT = "payment"
    TASK = "task"
    MAINTENANCE = "maintenance"
    FOLLOW_UP = "follow_up"
    CUSTOM = "custom"

class ReminderStatus(str, Enum):
    ACTIVE = "active"
    SENT = "sent"
    DISMISSED = "dismissed"
    EXPIRED = "expired"

class NotificationChannel(str, Enum):
    EMAIL = "email"
    WHATSAPP = "whatsapp"
    SMS = "sms"
    PUSH = "push"
    IN_APP = "in_app"

class RecurrenceType(str, Enum):
    NONE = "none"
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    YEARLY = "yearly"
    CUSTOM = "custom"

class Reminder(Document):
    # Basic Information
    title: str = Field(..., description="Reminder title")
    message: str = Field(..., description="Reminder message")
    reminder_type: ReminderType = Field(..., description="Type of reminder")
    
    # Status
    status: ReminderStatus = Field(default=ReminderStatus.ACTIVE)
    
    # Target & Recipients
    target_id: Optional[str] = None  # Event ID, Task ID, etc.
    recipients: List[str] = Field(default_factory=list)  # User IDs or phone numbers
    
    # Scheduling
    reminder_datetime: datetime = Field(..., description="When to send reminder")
    sent_at: Optional[datetime] = None
    
    # Recurrence
    recurrence_type: RecurrenceType = Field(default=RecurrenceType.NONE)
    recurrence_interval: Optional[int] = None  # Every X days/weeks/months
    recurrence_end: Optional[datetime] = None
    next_reminder: Optional[datetime] = None
    
    # Notification Channels
    channels: List[NotificationChannel] = Field(default_factory=list)
    
    # Metadata
    priority: str = Field(default="medium")  # low, medium, high, urgent
    category: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    
    # Auto-dismiss settings
    auto_dismiss_after_event: bool = Field(default=False)
    auto_dismiss_after_days: Optional[int] = None
    
    # Tracking
    times_sent: int = Field(default=0)
    last_sent: Optional[datetime] = None
    delivery_status: Optional[str] = None
    
    # Custom Actions
    action_required: bool = Field(default=False)
    action_url: Optional[str] = None
    action_text: Optional[str] = None
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: Optional[str] = None  # User ID
    
    # Integration
    sheets_row_id: Optional[int] = None
    
    class Settings:
        name = "reminders"
        indexes = [
            "reminder_datetime",
            "status",
            "reminder_type",
            "target_id",
            "next_reminder",
            "created_at"
        ]
    
    def is_due(self) -> bool:
        """Check if reminder is due to be sent"""
        if self.status != ReminderStatus.ACTIVE:
            return False
        return datetime.utcnow() >= self.reminder_datetime
    
    def is_overdue(self) -> bool:
        """Check if reminder is overdue"""
        if self.status != ReminderStatus.ACTIVE:
            return False
        return datetime.utcnow() > self.reminder_datetime

class ReminderCreate(BaseModel):
    title: str
    message: str
    reminder_type: ReminderType
    target_id: Optional[str] = None
    recipients: List[str] = []
    reminder_datetime: datetime
    recurrence_type: RecurrenceType = RecurrenceType.NONE
    recurrence_interval: Optional[int] = None
    recurrence_end: Optional[datetime] = None
    channels: List[NotificationChannel] = []
    priority: str = "medium"
    category: Optional[str] = None
    tags: List[str] = []
    auto_dismiss_after_event: bool = False
    auto_dismiss_after_days: Optional[int] = None
    action_required: bool = False
    action_url: Optional[str] = None
    action_text: Optional[str] = None

class ReminderUpdate(BaseModel):
    title: Optional[str] = None
    message: Optional[str] = None
    reminder_type: Optional[ReminderType] = None
    status: Optional[ReminderStatus] = None
    target_id: Optional[str] = None
    recipients: Optional[List[str]] = None
    reminder_datetime: Optional[datetime] = None
    recurrence_type: Optional[RecurrenceType] = None
    recurrence_interval: Optional[int] = None
    recurrence_end: Optional[datetime] = None
    channels: Optional[List[NotificationChannel]] = None
    priority: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    action_required: Optional[bool] = None
    action_url: Optional[str] = None
    action_text: Optional[str] = None

class ReminderResponse(BaseModel):
    id: str
    title: str
    message: str
    reminder_type: ReminderType
    status: ReminderStatus
    target_id: Optional[str]
    recipients: List[str]
    reminder_datetime: datetime
    sent_at: Optional[datetime]
    recurrence_type: RecurrenceType
    recurrence_interval: Optional[int]
    recurrence_end: Optional[datetime]
    next_reminder: Optional[datetime]
    channels: List[NotificationChannel]
    priority: str
    category: Optional[str]
    tags: List[str]
    auto_dismiss_after_event: bool
    auto_dismiss_after_days: Optional[int]
    times_sent: int
    last_sent: Optional[datetime]
    delivery_status: Optional[str]
    action_required: bool
    action_url: Optional[str]
    action_text: Optional[str]
    created_at: datetime
    updated_at: datetime
    is_due: bool
    is_overdue: bool

class ReminderStats(BaseModel):
    total_reminders: int
    active_reminders: int
    due_reminders: int
    overdue_reminders: int
    sent_today: int
    by_type: dict
    by_status: dict