from enum import Enum


class UserRole(str, Enum):
    ADMIN = "admin"
    STAFF = "staff"


class EventType(str, Enum):
    WEDDING = "wedding"
    HENNA = "henna"
    ENGAGEMENT = "engagement"
    GRADUATION = "graduation"
    BIRTHDAY = "birthday"
    OTHER = "other"


class EventLocation(str, Enum):
    HALL_FLOOR_0 = "hall_floor_0"
    HALL_FLOOR_1 = "hall_floor_1"
    GARDEN = "garden"
    WATERFALL = "waterfall"


class EventStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class PaymentStatus(str, Enum):
    PENDING = "pending"
    PARTIAL = "partial"
    PAID = "paid"
    REFUNDED = "refunded"
    OVERDUE = "overdue"


class PaymentMethod(str, Enum):
    CASH = "cash"
    BANK_TRANSFER = "bank_transfer"
    CREDIT_CARD = "credit_card"
    CHECK = "check"
    OTHER = "other"


class TaskStatus(str, Enum):
    TODO = "todo"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class TaskPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class ReminderType(str, Enum):
    ONE_TIME = "one_time"
    RECURRING = "recurring"


class ReminderFrequency(str, Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    YEARLY = "yearly"


class ExpenseCategory(str, Enum):
    FOOD = "food"
    DECORATION = "decoration"
    MUSIC = "music"
    PHOTOGRAPHY = "photography"
    STAFF = "staff"
    UTILITIES = "utilities"
    MAINTENANCE = "maintenance"
    OTHER = "other"


class Gender(str, Enum):
    MALE = "male"
    FEMALE = "female"
    MIXED = "mixed"


class Language(str, Enum):
    ENGLISH = "en"
    HEBREW = "he"
    ARABIC = "ar"