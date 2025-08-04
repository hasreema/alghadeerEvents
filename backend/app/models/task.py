from datetime import datetime
from typing import Optional, List, Dict
from pydantic import Field
from beanie import Indexed

from app.models.base import BaseDocument
from app.models.enums import TaskStatus, TaskPriority


class TaskComment(BaseDocument):
    """Embedded document for task comments."""
    user_id: str
    user_name: str
    comment: str
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Task(BaseDocument):
    """Task model for managing event-related and general tasks."""
    
    # Task Information
    title: str
    description: Optional[str] = None
    status: TaskStatus = TaskStatus.TODO
    priority: TaskPriority = TaskPriority.MEDIUM
    
    # Assignment
    assigned_to: Optional[str] = None  # User ID
    assigned_to_name: Optional[str] = None  # Denormalized
    assigned_by: Optional[str] = None  # User ID
    assigned_by_name: Optional[str] = None  # Denormalized
    
    # Event Reference (optional)
    event_id: Optional[Indexed(str)] = None
    event_name: Optional[str] = None
    
    # Dates
    due_date: Optional[datetime] = None
    start_date: Optional[datetime] = None
    completed_date: Optional[datetime] = None
    
    # Checklist Items
    checklist: List[Dict[str, bool]] = Field(default_factory=list)
    # Example: [{"item": "Book photographer", "completed": true}]
    
    # Progress
    progress_percentage: int = Field(default=0, ge=0, le=100)
    
    # Comments and Activity
    comments: List[TaskComment] = Field(default_factory=list)
    
    # Tags and Categories
    tags: List[str] = Field(default_factory=list)
    category: Optional[str] = None
    
    # Reminders
    reminder_enabled: bool = False
    reminder_before_hours: int = Field(default=24)  # Hours before due date
    reminder_sent: bool = False
    
    # Dependencies
    depends_on: List[str] = Field(default_factory=list)  # Other task IDs
    blocks: List[str] = Field(default_factory=list)  # Task IDs this blocks
    
    # Attachments
    attachments: List[str] = Field(default_factory=list)  # URLs
    
    # Integration
    google_sheets_row_id: Optional[int] = None
    
    def is_overdue(self) -> bool:
        """Check if task is overdue."""
        if self.due_date and self.status not in [TaskStatus.COMPLETED, TaskStatus.CANCELLED]:
            return datetime.utcnow() > self.due_date
        return False
    
    def calculate_checklist_progress(self) -> int:
        """Calculate progress based on checklist completion."""
        if not self.checklist:
            return 0
        completed = sum(1 for item in self.checklist if item.get("completed", False))
        return int((completed / len(self.checklist)) * 100)
    
    class Settings:
        name = "tasks"
        indexes = [
            "event_id",
            "assigned_to",
            "status",
            "priority",
            "due_date"
        ]
    
    class Config:
        schema_extra = {
            "example": {
                "title": "Book photographer for wedding",
                "description": "Contact and confirm photographer for Sarah & John wedding",
                "status": "todo",
                "priority": "high",
                "assigned_to": "60d5f483f8cf1c1a8c0e9d80",
                "event_id": "60d5f483f8cf1c1a8c0e9d81",
                "event_name": "Sarah & John Wedding",
                "due_date": "2024-05-01T00:00:00",
                "tags": ["photography", "vendor"],
                "checklist": [
                    {"item": "Contact photographer", "completed": True},
                    {"item": "Confirm availability", "completed": True},
                    {"item": "Sign contract", "completed": False}
                ]
            }
        }