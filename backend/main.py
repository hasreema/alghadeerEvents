from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.security import HTTPBearer
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv

from database import init_database, close_database
from auth.auth import get_current_user
from api.routers import auth, events, payments, employees, tasks, reports, notifications, google_sheets

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_database()
    yield
    # Shutdown
    await close_database()

app = FastAPI(
    title="Al Ghadeer Events Management System",
    description="Comprehensive event management system for hall owners",
    version="1.0.0",
    contact={
        "name": "Al Ghadeer Events",
        "email": "alghadeerevents@gmail.com",
        "phone": "+970595781722"
    },
    lifespan=lifespan
)

# Security
security = HTTPBearer()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001", 
        "https://alghadeer-events.vercel.app",
        "https://app.glideapps.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Trusted hosts
app.add_middleware(
    TrustedHostMiddleware, 
    allowed_hosts=["localhost", "127.0.0.1", "*.vercel.app", "*.railway.app"]
)

# API Routes
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(events.router, prefix="/api/events", tags=["Events"])
app.include_router(payments.router, prefix="/api/payments", tags=["Payments"])
app.include_router(employees.router, prefix="/api/employees", tags=["Employees"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["Tasks"])
app.include_router(reports.router, prefix="/api/reports", tags=["Reports"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["Notifications"])
app.include_router(google_sheets.router, prefix="/api/google-sheets", tags=["Google Sheets"])

@app.get("/")
async def root():
    return {
        "message": "Al Ghadeer Events Management System API",
        "version": "1.0.0",
        "status": "running",
        "docs_url": "/docs"
    }

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "Al Ghadeer Events Management System",
        "version": "1.0.0"
    }

@app.get("/api/protected")
async def protected_route(current_user = Depends(get_current_user)):
    return {"message": f"Hello {current_user.email}! This is a protected route."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=True if os.getenv("ENVIRONMENT") == "development" else False
    )