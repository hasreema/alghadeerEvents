from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from typing import Optional
from app.core.config import settings
import asyncio

# Import models to register
from app.models.user import User
from app.models.event import Event
from app.models.task import Task
from app.models.payment import Payment
from app.models.employee import Employee
from app.models.expense import Expense
from app.models.reminder import Reminder

client: Optional[AsyncIOMotorClient] = None

async def connect_to_mongo():
    global client
    if client is None:
        client = AsyncIOMotorClient(settings.mongodb_url)
        await init_beanie(
            database=client[settings.database_name],
            document_models=[User, Event, Task, Payment, Employee, Expense, Reminder],
        )

async def close_mongo_connection():
    global client
    if client is not None:
        client.close()
        client = None

async def init_db():
    # Placeholder for creating indexes or seed data if needed
    await asyncio.sleep(0)