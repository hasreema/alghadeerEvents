from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List, Optional
from datetime import datetime

from models.employee import Employee, EmployeeCreate, EmployeeUpdate, EmployeeResponse, EmployeeStats, WorkShiftCreate
from models.user import User
from auth.auth import get_current_user, require_admin_or_staff

router = APIRouter()

@router.post("/", response_model=EmployeeResponse)
async def create_employee(
    employee_data: EmployeeCreate,
    current_user: User = Depends(require_admin_or_staff)
):
    """Create a new employee"""
    employee = Employee(
        **employee_data.dict(),
        created_by=str(current_user.id)
    )
    
    await employee.insert()
    
    return EmployeeResponse(
        id=str(employee.id),
        full_name=employee.full_name,
        phone=employee.phone,
        email=employee.email,
        address=employee.address,
        employee_id=employee.employee_id,
        role=employee.role,
        status=employee.status,
        hire_date=employee.hire_date,
        hourly_rate=employee.hourly_rate,
        overtime_rate=employee.overtime_rate,
        total_hours_worked=employee.total_hours_worked,
        total_earnings=employee.total_earnings,
        pending_payments=employee.pending_payments,
        skills=employee.skills,
        certifications=employee.certifications,
        languages=employee.languages,
        emergency_contact_name=employee.emergency_contact_name,
        emergency_contact_phone=employee.emergency_contact_phone,
        rating=employee.rating,
        notes=employee.notes,
        created_at=employee.created_at,
        updated_at=employee.updated_at
    )

@router.get("/", response_model=List[EmployeeResponse])
async def get_employees(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    role: Optional[str] = None,
    status: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """Get employees with filtering"""
    query = {}
    
    if role:
        query["role"] = role
    if status:
        query["status"] = status
    
    if query:
        employees = await Employee.find(query).skip(skip).limit(limit).to_list()
    else:
        employees = await Employee.find_all().skip(skip).limit(limit).to_list()
    
    return [
        EmployeeResponse(
            id=str(employee.id),
            full_name=employee.full_name,
            phone=employee.phone,
            email=employee.email,
            address=employee.address,
            employee_id=employee.employee_id,
            role=employee.role,
            status=employee.status,
            hire_date=employee.hire_date,
            hourly_rate=employee.hourly_rate,
            overtime_rate=employee.overtime_rate,
            total_hours_worked=employee.total_hours_worked,
            total_earnings=employee.total_earnings,
            pending_payments=employee.pending_payments,
            skills=employee.skills,
            certifications=employee.certifications,
            languages=employee.languages,
            emergency_contact_name=employee.emergency_contact_name,
            emergency_contact_phone=employee.emergency_contact_phone,
            rating=employee.rating,
            notes=employee.notes,
            created_at=employee.created_at,
            updated_at=employee.updated_at
        )
        for employee in employees
    ]

@router.get("/{employee_id}", response_model=EmployeeResponse)
async def get_employee(employee_id: str, current_user: User = Depends(get_current_user)):
    """Get employee by ID"""
    employee = await Employee.get(employee_id)
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found"
        )
    
    return EmployeeResponse(
        id=str(employee.id),
        full_name=employee.full_name,
        phone=employee.phone,
        email=employee.email,
        address=employee.address,
        employee_id=employee.employee_id,
        role=employee.role,
        status=employee.status,
        hire_date=employee.hire_date,
        hourly_rate=employee.hourly_rate,
        overtime_rate=employee.overtime_rate,
        total_hours_worked=employee.total_hours_worked,
        total_earnings=employee.total_earnings,
        pending_payments=employee.pending_payments,
        skills=employee.skills,
        certifications=employee.certifications,
        languages=employee.languages,
        emergency_contact_name=employee.emergency_contact_name,
        emergency_contact_phone=employee.emergency_contact_phone,
        rating=employee.rating,
        notes=employee.notes,
        created_at=employee.created_at,
        updated_at=employee.updated_at
    )

@router.put("/{employee_id}", response_model=EmployeeResponse)
async def update_employee(
    employee_id: str,
    employee_update: EmployeeUpdate,
    current_user: User = Depends(require_admin_or_staff)
):
    """Update employee"""
    employee = await Employee.get(employee_id)
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found"
        )
    
    update_data = employee_update.dict(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(employee, field, value)
    
    employee.updated_at = datetime.utcnow()
    await employee.save()
    
    return EmployeeResponse(
        id=str(employee.id),
        full_name=employee.full_name,
        phone=employee.phone,
        email=employee.email,
        address=employee.address,
        employee_id=employee.employee_id,
        role=employee.role,
        status=employee.status,
        hire_date=employee.hire_date,
        hourly_rate=employee.hourly_rate,
        overtime_rate=employee.overtime_rate,
        total_hours_worked=employee.total_hours_worked,
        total_earnings=employee.total_earnings,
        pending_payments=employee.pending_payments,
        skills=employee.skills,
        certifications=employee.certifications,
        languages=employee.languages,
        emergency_contact_name=employee.emergency_contact_name,
        emergency_contact_phone=employee.emergency_contact_phone,
        rating=employee.rating,
        notes=employee.notes,
        created_at=employee.created_at,
        updated_at=employee.updated_at
    )

@router.post("/{employee_id}/work-shift")
async def add_work_shift(
    employee_id: str,
    shift_data: WorkShiftCreate,
    current_user: User = Depends(require_admin_or_staff)
):
    """Add work shift for employee"""
    employee = await Employee.get(employee_id)
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found"
        )
    
    # Calculate hours worked
    hours_worked = (shift_data.end_time - shift_data.start_time).total_seconds() / 3600
    
    # Use provided rate or employee's default rate
    hourly_rate = shift_data.hourly_rate or employee.hourly_rate
    total_payment = hours_worked * hourly_rate
    
    from models.employee import WorkShift, PaymentStatus
    work_shift = WorkShift(
        event_id=shift_data.event_id,
        start_time=shift_data.start_time,
        end_time=shift_data.end_time,
        hours_worked=hours_worked,
        hourly_rate=hourly_rate,
        total_payment=total_payment,
        notes=shift_data.notes
    )
    
    employee.work_shifts.append(work_shift)
    employee.total_hours_worked += hours_worked
    employee.total_earnings += total_payment
    employee.pending_payments += total_payment
    employee.updated_at = datetime.utcnow()
    
    await employee.save()
    
    return {"message": "Work shift added successfully"}

@router.get("/stats/overview", response_model=EmployeeStats)
async def get_employee_stats(current_user: User = Depends(get_current_user)):
    """Get employee statistics"""
    employees = await Employee.find_all().to_list()
    
    from models.employee import EmployeeStatus
    total_employees = len(employees)
    active_employees = len([e for e in employees if e.status == EmployeeStatus.ACTIVE])
    
    # Calculate this month's hours
    from datetime import date
    this_month = date.today().replace(day=1)
    total_hours_this_month = sum(
        sum(
            shift.hours_worked for shift in emp.work_shifts
            if shift.start_time.date() >= this_month
        )
        for emp in employees
    )
    
    total_wages_pending = sum(emp.pending_payments for emp in employees)
    
    # Group by role
    by_role = {}
    for emp in employees:
        role = emp.role
        by_role[role] = by_role.get(role, 0) + 1
    
    # Top performers (by rating)
    top_performers = sorted(
        [{"name": emp.full_name, "rating": emp.rating} for emp in employees if emp.rating],
        key=lambda x: x["rating"],
        reverse=True
    )[:5]
    
    return EmployeeStats(
        total_employees=total_employees,
        active_employees=active_employees,
        total_hours_this_month=total_hours_this_month,
        total_wages_pending=total_wages_pending,
        by_role=by_role,
        top_performers=top_performers
    )