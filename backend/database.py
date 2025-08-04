from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
import os
from dotenv import load_dotenv

from models.user import User
from models.event import Event
from models.payment import Payment
from models.employee import Employee
from models.task import Task
from models.reminder import Reminder

load_dotenv()

# MongoDB client
client: AsyncIOMotorClient = None

async def init_database():
    """Initialize database connection and Beanie ODM"""
    global client
    
    # MongoDB connection string
    mongodb_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    database_name = os.getenv("DATABASE_NAME", "alghadeer_events")
    
    # Create motor client
    client = AsyncIOMotorClient(mongodb_url)
    
    # Initialize beanie with the document models
    await init_beanie(
        database=client[database_name],
        document_models=[
            User,
            Event, 
            Payment,
            Employee,
            Task,
            Reminder
        ]
    )
    
    print(f"✅ Connected to MongoDB: {database_name}")

async def close_database():
    """Close database connection"""
    global client
    if client:
        client.close()
        print("❌ Disconnected from MongoDB")

def get_database():
    """Get database instance"""
    return client.get_default_database()