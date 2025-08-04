from datetime import datetime
from typing import Optional
from beanie import Document, Indexed
from pydantic import Field


class BaseDocument(Document):
    """Base document with common fields."""
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: Optional[str] = None  # User ID
    updated_by: Optional[str] = None  # User ID
    
    def update_timestamp(self, user_id: Optional[str] = None):
        """Update the timestamp and user who made the change."""
        self.updated_at = datetime.utcnow()
        if user_id:
            self.updated_by = user_id
    
    class Config:
        use_enum_values = True
        validate_assignment = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }