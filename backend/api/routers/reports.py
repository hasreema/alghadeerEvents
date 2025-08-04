from fastapi import APIRouter, HTTPException, status, Depends, Query
from fastapi.responses import FileResponse
from typing import Optional
from datetime import datetime, date
import os

from models.user import User
from auth.auth import get_current_user, require_admin_or_staff

router = APIRouter()

@router.post("/monthly")
async def generate_monthly_report(
    year: int = Query(..., ge=2020, le=2030),
    month: int = Query(..., ge=1, le=12),
    current_user: User = Depends(require_admin_or_staff)
):
    """Generate monthly PDF report"""
    # TODO: Implement PDF generation
    return {"message": f"Monthly report for {month}/{year} generation started"}

@router.get("/dashboard")
async def get_dashboard_data(current_user: User = Depends(get_current_user)):
    """Get dashboard analytics data"""
    from models.event import Event
    from models.payment import Payment
    from models.employee import Employee
    from models.task import Task
    
    # Get basic counts
    events = await Event.find_all().to_list()
    payments = await Payment.find_all().to_list()
    employees = await Employee.find_all().to_list()
    tasks = await Task.find_all().to_list()
    
    # Calculate metrics
    total_events = len(events)
    total_revenue = sum(p.amount for p in payments)
    active_employees = len([e for e in employees if e.status == "active"])
    pending_tasks = len([t for t in tasks if t.status == "pending"])
    
    # Recent activity
    recent_events = sorted(events, key=lambda x: x.created_at, reverse=True)[:5]
    recent_payments = sorted(payments, key=lambda x: x.created_at, reverse=True)[:5]
    
    return {
        "summary": {
            "total_events": total_events,
            "total_revenue": total_revenue,
            "active_employees": active_employees,
            "pending_tasks": pending_tasks
        },
        "recent_events": [
            {
                "id": str(e.id),
                "title": e.title,
                "event_date": e.event_date,
                "status": e.status
            }
            for e in recent_events
        ],
        "recent_payments": [
            {
                "id": str(p.id),
                "amount": p.amount,
                "payment_date": p.payment_date,
                "event_id": p.event_id
            }
            for p in recent_payments
        ]
    }

@router.get("/profitability")
async def get_profitability_report(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    current_user: User = Depends(get_current_user)
):
    """Get profitability analysis"""
    from models.event import Event
    
    query = {}
    if start_date:
        query["event_date"] = {"$gte": start_date}
    if end_date:
        if "event_date" in query:
            query["event_date"]["$lte"] = end_date
        else:
            query["event_date"] = {"$lte": end_date}
    
    if query:
        events = await Event.find(query).to_list()
    else:
        events = await Event.find_all().to_list()
    
    # Calculate profitability metrics
    total_revenue = sum(e.amount_paid for e in events)
    total_costs = sum(e.total_expenses + e.labor_cost for e in events)
    total_profit = total_revenue - total_costs
    
    # Per-event breakdown
    event_breakdown = [
        {
            "event_id": str(e.id),
            "title": e.title,
            "revenue": e.amount_paid,
            "costs": e.total_expenses + e.labor_cost,
            "profit": e.calculate_profit(),
            "margin_percent": (e.calculate_profit() / e.amount_paid * 100) if e.amount_paid > 0 else 0
        }
        for e in events
    ]
    
    # Monthly breakdown
    monthly_data = {}
    for event in events:
        month_key = event.event_date.strftime("%Y-%m")
        if month_key not in monthly_data:
            monthly_data[month_key] = {
                "revenue": 0,
                "costs": 0,
                "profit": 0,
                "event_count": 0
            }
        
        monthly_data[month_key]["revenue"] += event.amount_paid
        monthly_data[month_key]["costs"] += event.total_expenses + event.labor_cost
        monthly_data[month_key]["profit"] += event.calculate_profit()
        monthly_data[month_key]["event_count"] += 1
    
    return {
        "summary": {
            "total_revenue": total_revenue,
            "total_costs": total_costs,
            "total_profit": total_profit,
            "profit_margin": (total_profit / total_revenue * 100) if total_revenue > 0 else 0
        },
        "by_event": event_breakdown,
        "by_month": monthly_data
    }

@router.get("/export/events")
async def export_events_csv(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    current_user: User = Depends(require_admin_or_staff)
):
    """Export events data as CSV"""
    # TODO: Implement CSV export
    return {"message": "CSV export functionality will be implemented"}

@router.get("/export/payments")
async def export_payments_csv(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    current_user: User = Depends(require_admin_or_staff)
):
    """Export payments data as CSV"""
    # TODO: Implement CSV export
    return {"message": "CSV export functionality will be implemented"}

@router.post("/send-monthly")
async def send_monthly_report(
    year: int = Query(..., ge=2020, le=2030),
    month: int = Query(..., ge=1, le=12),
    email: Optional[str] = None,
    current_user: User = Depends(require_admin_or_staff)
):
    """Generate and send monthly report via email"""
    # TODO: Implement email sending
    recipient = email or current_user.email
    return {"message": f"Monthly report for {month}/{year} will be sent to {recipient}"}