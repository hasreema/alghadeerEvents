from datetime import datetime
from typing import Optional, List
from beanie import Document
from pydantic import BaseModel

class TaskComment(BaseModel):
    user_id: str
    user_name: str
    comment: str
    created_at: datetime = datetime.utcnow()

class Task(Document):
    title: str
    description: Optional[str] = None
    status: str = "todo"  # todo, in_progress, completed, cancelled
    priority: str = "medium"  # low, medium, high, urgent

    assigned_to: Optional[str] = None
    assigned_to_name: Optional[str] = None
    assigned_by: Optional[str] = None
    assigned_by_name: Optional[str] = None

    event_id: Optional[str] = None
    event_name: Optional[str] = None

    due_date: Optional[datetime] = None
    progress_percentage: int = 0
    tags: List[str] = []

    checklist: List[dict] = []
    comments: List[TaskComment] = []

    created_by: Optional[str] = None
    updated_by: Optional[str] = None
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()

    def update_timestamp(self, by_user_id: Optional[str] = None):
        self.updated_at = datetime.utcnow()
        if by_user_id:
            self.updated_by = by_user_id

    def calculate_checklist_progress(self) -> int:
        if not self.checklist:
            return 0
        completed = sum(1 for item in self.checklist if item.get("done"))
        return int((completed / len(self.checklist)) * 100)

    def is_overdue(self) -> bool:
        return bool(self.due_date and self.due_date < datetime.utcnow() and self.status not in ("completed", "cancelled"))

    class Settings:
        name = "tasks"
        use_state_management = True
        validate_on_save = True