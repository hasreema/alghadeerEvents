from datetime import datetime
from typing import Optional
from beanie import Document
from pydantic import EmailStr

class User(Document):
    email: EmailStr
    username: str
    full_name: str
    hashed_password: str
    role: str = "staff"  # admin, staff
    is_active: bool = True
    is_verified: bool = True
    preferred_language: str = "en"

    phone_number: Optional[str] = None
    department: Optional[str] = None
    avatar_url: Optional[str] = None

    email_notifications: bool = True
    whatsapp_notifications: bool = False
    push_notifications: bool = False

    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()

    def update_timestamp(self, _by: Optional[str] = None):
        self.updated_at = datetime.utcnow()

    class Settings:
        name = "users"
        use_state_management = True
        validate_on_save = True

    class Config:
        json_schema_extra = {"example": {
            "email": "admin@alghadeer.com",
            "username": "admin",
            "full_name": "System Administrator",
            "hashed_password": "...",
            "role": "admin",
        }}