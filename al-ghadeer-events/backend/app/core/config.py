from pydantic_settings import BaseSettings
from pydantic import AnyHttpUrl, Field
from typing import List

class Settings(BaseSettings):
    # App
    app_name: str = Field(default="Al Ghadeer Events Management System")
    app_version: str = Field(default="1.0.0")
    debug: bool = Field(default=True)
    host: str = Field(default="0.0.0.0")
    port: int = Field(default=8000)

    # MongoDB
    mongodb_url: str = Field(default="mongodb://localhost:27017")
    database_name: str = Field(default="al_ghadeer_events")

    # JWT
    secret_key: str = Field(default="change-me-in-production")
    access_token_expire_minutes: int = Field(default=60)
    refresh_token_expire_days: int = Field(default=7)

    # Admin
    admin_email: str = Field(default="admin@alghadeer.com")
    admin_password: str = Field(default="admin123")

    # CORS
    cors_origins: List[AnyHttpUrl] = Field(default_factory=lambda: [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ])

    # Uploads
    upload_dir: str = Field(default="./uploads")
    max_upload_size: int = Field(default=5 * 1024 * 1024)

    # Timezone
    timezone: str = Field(default="Asia/Jerusalem")

    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()