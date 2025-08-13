from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
import logging
import sys

from app.core.config import settings
from app.core.database import connect_to_mongo, close_mongo_connection, init_db

# Import routers
from app.api.auth import router as auth_router
from app.api.events import router as events_router
from app.api.payments import router as payments_router
from app.api.employees import router as employees_router
from app.api.tasks import router as tasks_router
from app.api.reminders import router as reminders_router
from app.api.expenses import router as expenses_router
from app.api.reports import router as reports_router
from app.api.notifications import router as notifications_router
# from app.api.google_sheets import router as google_sheets_router

# Configure logging
logging.basicConfig(
    level=logging.INFO if not settings.debug else logging.DEBUG,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifespan."""
    # Startup
    logger.info("Starting up Al Ghadeer Events Management System...")
    await connect_to_mongo()
    await init_db()
    
    # Create admin user if doesn't exist
    try:
        from app.models.user import User
        from app.core.security import get_password_hash
        
        admin_exists = await User.find_one(User.email == settings.admin_email)
        if not admin_exists:
            admin_user = User(
                email=settings.admin_email,
                username="admin",
                full_name="System Administrator",
                hashed_password=get_password_hash(settings.admin_password),
                role="admin",
                is_active=True,
                is_verified=True,
                preferred_language="en"
            )
            await admin_user.create()
            logger.info("Admin user created successfully")
    except Exception as e:
        logger.error(f"Error creating admin user: {e}")
    
    yield
    
    # Shutdown
    logger.info("Shutting down...")
    await close_mongo_connection()


# Create FastAPI app
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Comprehensive event management system for Al Ghadeer Events",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# Add middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(GZipMiddleware, minimum_size=1000)

# Health check endpoint
@app.get("/", tags=["Health"])
async def root():
    """Root endpoint - health check."""
    return {
        "message": "Al Ghadeer Events Management System API",
        "version": settings.app_version,
        "status": "healthy"
    }

@app.get("/health", tags=["Health"])
async def health_check():
    """Detailed health check."""
    try:
        # Check database connection
        from app.core.database import db
        db_status = "connected" if db.client else "disconnected"
        
        return {
            "status": "healthy",
            "version": settings.app_version,
            "database": db_status,
            "environment": "production" if not settings.debug else "development"
        }
    except Exception as e:
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "error": str(e)
            }
        )

# Include routers
app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])
app.include_router(events_router, prefix="/api/events", tags=["Events"])
app.include_router(payments_router, prefix="/api/payments", tags=["Payments"])
app.include_router(employees_router, prefix="/api/employees", tags=["Employees"])
app.include_router(tasks_router, prefix="/api/tasks", tags=["Tasks"])
app.include_router(reminders_router, prefix="/api/reminders", tags=["Reminders"])
app.include_router(expenses_router, prefix="/api/expenses", tags=["Expenses"])
app.include_router(reports_router, prefix="/api/reports", tags=["Reports"])
app.include_router(notifications_router, prefix="/api/notifications", tags=["Notifications"])
# app.include_router(google_sheets_router, prefix="/api/google-sheets", tags=["Google Sheets"])

# Exception handlers
@app.exception_handler(404)
async def not_found_handler(request, exc):
    return JSONResponse(
        status_code=404,
        content={"detail": "Resource not found"}
    )

@app.exception_handler(500)
async def internal_error_handler(request, exc):
    logger.error(f"Internal server error: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
        log_level="debug" if settings.debug else "info"
    )