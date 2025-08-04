from typing import Optional, List
from pydantic import EmailStr, Field
from beanie import Indexed

from app.models.base import BaseDocument
from app.models.enums import UserRole, Language


class User(BaseDocument):
    """User model for authentication and authorization."""
    
    email: Indexed(EmailStr, unique=True)
    username: Indexed(str, unique=True)
    full_name: str
    hashed_password: str
    role: UserRole = UserRole.STAFF
    is_active: bool = True
    is_verified: bool = False
    phone_number: Optional[str] = None
    preferred_language: Language = Language.ENGLISH
    
    # Notification preferences
    email_notifications: bool = True
    whatsapp_notifications: bool = True
    push_notifications: bool = True
    
    # Profile
    avatar_url: Optional[str] = None
    department: Optional[str] = None
    
    class Settings:
        name = "users"
        indexes = [
            "email",
            "username",
            "role",
            "is_active"
        ]
    
    class Config:
        schema_extra = {
            "example": {
                "email": "admin@alghadeer-events.com",
                "username": "admin",
                "full_name": "Admin User",
                "role": "admin",
                "phone_number": "+970595781722",
                "preferred_language": "en"
            }
        }