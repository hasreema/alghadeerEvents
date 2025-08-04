from beanie import Document
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum
from bson import ObjectId

class TaskStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    ON_HOLD = "on_hold"

class TaskPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"

class TaskCategory(str, Enum):
    SETUP = "setup"
    CLEANUP = "cleanup"
    DECORATION = "decoration"
    EQUIPMENT = "equipment"
    CATERING = "catering"
    SECURITY = "security"
    COORDINATION = "coordination"
    MAINTENANCE = "maintenance"
    ADMINISTRATIVE = "administrative"
    OTHER = "other"

class Task(Document):
    # Basic Information
    title: str = Field(..., description="Task title")
    description: Optional[str] = None
    category: TaskCategory = Field(..., description="Task category")
    
    # Status & Priority
    status: TaskStatus = Field(default=TaskStatus.PENDING)
    priority: TaskPriority = Field(default=TaskPriority.MEDIUM)
    
    # Assignment
    assigned_to: Optional[str] = None  # Employee ID
    assigned_by: Optional[str] = None  # User ID
    
    # Event Reference
    event_id: Optional[str] = None  # If task is event-specific
    
    # Timing
    due_date: Optional[datetime] = None
    estimated_duration: Optional[int] = None  # Minutes
    actual_duration: Optional[int] = None  # Minutes
    
    # Completion
    completed_at: Optional[datetime] = None
    completed_by: Optional[str] = None  # User ID
    completion_notes: Optional[str] = None
    
    # Dependencies
    depends_on: List[str] = Field(default_factory=list)  # Task IDs
    blocked_by: List[str] = Field(default_factory=list)  # Task IDs
    
    # Attachments & Notes
    attachments: List[str] = Field(default_factory=list)  # File URLs
    notes: Optional[str] = None
    
    # Recurrence
    is_recurring: bool = Field(default=False)
    recurrence_pattern: Optional[str] = None  # "daily", "weekly", "monthly"
    next_occurrence: Optional[datetime] = None
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: Optional[str] = None  # User ID
    
    # Integration
    sheets_row_id: Optional[int] = None
    
    class Settings:
        name = "tasks"
        indexes = [
            "status",
            "priority",
            "assigned_to",
            "event_id",
            "due_date",
            "category",
            "created_at"
        ]
    
    def is_overdue(self) -> bool:
        """Check if task is overdue"""
        if not self.due_date or self.status == TaskStatus.COMPLETED:
            return False
        return datetime.utcnow() > self.due_date

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    category: TaskCategory
    priority: TaskPriority = TaskPriority.MEDIUM
    assigned_to: Optional[str] = None
    event_id: Optional[str] = None
    due_date: Optional[datetime] = None
    estimated_duration: Optional[int] = None
    depends_on: List[str] = []
    notes: Optional[str] = None
    is_recurring: bool = False
    recurrence_pattern: Optional[str] = None

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[TaskCategory] = None
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None
    assigned_to: Optional[str] = None
    due_date: Optional[datetime] = None
    estimated_duration: Optional[int] = None
    actual_duration: Optional[int] = None
    completion_notes: Optional[str] = None
    depends_on: Optional[List[str]] = None
    notes: Optional[str] = None

class TaskResponse(BaseModel):
    id: str
    title: str
    description: Optional[str]
    category: TaskCategory
    status: TaskStatus
    priority: TaskPriority
    assigned_to: Optional[str]
    assigned_by: Optional[str]
    event_id: Optional[str]
    due_date: Optional[datetime]
    estimated_duration: Optional[int]
    actual_duration: Optional[int]
    completed_at: Optional[datetime]
    completed_by: Optional[str]
    completion_notes: Optional[str]
    depends_on: List[str]
    blocked_by: List[str]
    attachments: List[str]
    notes: Optional[str]
    is_recurring: bool
    recurrence_pattern: Optional[str]
    next_occurrence: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    is_overdue: bool

class TaskStats(BaseModel):
    total_tasks: int
    pending_tasks: int
    in_progress_tasks: int
    completed_tasks: int
    overdue_tasks: int
    by_priority: dict
    by_category: dict
    by_status: dict