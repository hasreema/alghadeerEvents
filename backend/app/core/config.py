from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import Field, validator
import json


class Settings(BaseSettings):
    # Application
    app_name: str = Field(default="Al Ghadeer Events Management")
    app_version: str = Field(default="1.0.0")
    debug: bool = Field(default=False)
    secret_key: str
    algorithm: str = Field(default="HS256")
    access_token_expire_minutes: int = Field(default=10080)  # 7 days
    
    # Server
    host: str = Field(default="0.0.0.0")
    port: int = Field(default=8000)
    cors_origins: List[str] = Field(default=["http://localhost:3000"])
    
    # Database
    mongodb_url: str = Field(default="mongodb://localhost:27017")
    mongodb_name: str = Field(default="al_ghadeer_events")
    
    # Google Services
    google_sheets_id: Optional[str] = None
    google_service_account_file: Optional[str] = None
    google_calendar_id: Optional[str] = None
    
    # Email Configuration
    smtp_host: str = Field(default="smtp.gmail.com")
    smtp_port: int = Field(default=587)
    smtp_user: Optional[str] = None
    smtp_password: Optional[str] = None
    email_from: str = Field(default="Al Ghadeer Events <noreply@alghadeer-events.com>")
    email_from_name: str = Field(default="Al Ghadeer Events")
    
    # WhatsApp Business API
    whatsapp_api_url: str = Field(default="https://graph.facebook.com/v17.0")
    whatsapp_phone_number_id: Optional[str] = None
    whatsapp_access_token: Optional[str] = None
    
    # Zapier Webhooks
    zapier_webhook_url: Optional[str] = None
    
    # Google Cloud Storage
    gcs_bucket_name: Optional[str] = None
    gcs_project_id: Optional[str] = None
    gcs_credentials_file: Optional[str] = None
    
    # Timezone
    timezone: str = Field(default="Asia/Jerusalem")
    
    # Sentry
    sentry_dsn: Optional[str] = None
    
    # Redis
    redis_url: Optional[str] = None
    
    # File Upload
    max_file_size: int = Field(default=10485760)  # 10MB
    allowed_file_types: List[str] = Field(
        default=["image/jpeg", "image/png", "image/gif", "application/pdf"]
    )
    
    # Pagination
    default_page_size: int = Field(default=20)
    max_page_size: int = Field(default=100)
    
    # Languages
    default_language: str = Field(default="en")
    supported_languages: List[str] = Field(default=["en", "he", "ar"])
    
    # Reports
    reports_output_dir: str = Field(default="./reports")
    report_logo_path: Optional[str] = Field(default="./assets/logo.png")
    
    # Security
    rate_limit_per_minute: int = Field(default=60)
    jwt_expiration_days: int = Field(default=7)
    
    # Frontend URL
    frontend_url: str = Field(default="http://localhost:3000")
    
    # Admin User
    admin_email: str = Field(default="admin@alghadeer-events.com")
    admin_password: str = Field(default="change-this-password")
    
    @validator("cors_origins", pre=True)
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except json.JSONDecodeError:
                return [v]
        return v
    
    @validator("supported_languages", "allowed_file_types", pre=True)
    def parse_list_fields(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except json.JSONDecodeError:
                return v.split(",")
        return v
    
    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()