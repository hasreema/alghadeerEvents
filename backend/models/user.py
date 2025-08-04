from beanie import Document
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum
from bson import ObjectId

class UserRole(str, Enum):
    ADMIN = "admin"
    STAFF = "staff"

class UserSettings(BaseModel):
    language: str = "en"  # en, ar, he
    timezone: str = "Asia/Jerusalem"
    notifications_email: bool = True
    notifications_whatsapp: bool = True
    theme: str = "light"

class User(Document):
    email: EmailStr = Field(..., unique=True, description="User email address")
    hashed_password: str = Field(..., description="Hashed password")
    full_name: str = Field(..., description="Full name")
    phone: Optional[str] = Field(None, description="Phone number")
    role: UserRole = Field(default=UserRole.STAFF, description="User role")
    is_active: bool = Field(default=True, description="User account status")
    settings: UserSettings = Field(default_factory=UserSettings)
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_login: Optional[datetime] = None
    
    class Settings:
        name = "users"
        indexes = [
            "email",
            "role",
            "is_active"
        ]
    
    def __str__(self) -> str:
        return f"User(email={self.email}, role={self.role})"

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: str
    phone: Optional[str] = None
    role: UserRole = UserRole.STAFF

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None
    settings: Optional[UserSettings] = None

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    phone: Optional[str]
    role: UserRole
    is_active: bool
    settings: UserSettings
    created_at: datetime
    last_login: Optional[datetime]

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int

class UserLogin(BaseModel):
    email: EmailStr
    password: str