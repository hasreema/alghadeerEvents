from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from typing import Optional
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)

class Database:
    client: Optional[AsyncIOMotorClient] = None


db = Database()


async def connect_to_mongo():
    """Create database connection."""
    try:
        db.client = AsyncIOMotorClient(settings.mongodb_url)
        logger.info("Connected to MongoDB")
    except Exception as e:
        logger.error(f"Could not connect to MongoDB: {e}")
        raise


async def close_mongo_connection():
    """Close database connection."""
    if db.client:
        db.client.close()
        logger.info("Disconnected from MongoDB")


async def init_db():
    """Initialize database with Beanie ODM."""
    from app.models.user import User
    from app.models.event import Event
    from app.models.payment import Payment
    from app.models.employee import Employee
    from app.models.task import Task
    from app.models.reminder import Reminder
    from app.models.expense import Expense
    
    await init_beanie(
        database=db.client[settings.mongodb_name],
        document_models=[
            User,
            Event,
            Payment,
            Employee,
            Task,
            Reminder,
            Expense,
        ],
    )
    logger.info("Beanie initialized")


def get_database():
    """Get database instance."""
    return db.client[settings.mongodb_name]