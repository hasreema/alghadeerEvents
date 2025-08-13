from typing import Annotated, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.dependencies import get_current_user, PaginationParams
from app.models.user import User
from app.models.employee import Employee
from app.api.schemas import (
    EmployeeCreate,
    EmployeeUpdate,
    EmployeeResponse,
    PaginatedResponse,
    MessageResponse,
)

router = APIRouter()

@router.get("/", response_model=PaginatedResponse)
async def list_employees(
    current_user: Annotated[User, Depends(get_current_user)],
    pagination: Annotated[PaginationParams, Depends()],
    is_active: Optional[bool] = Query(None),
    department: Optional[str] = Query(None),
):
    query: dict = {}
    if is_active is not None:
        query["is_active"] = is_active
    if department:
        query["department"] = department

    total = await Employee.find(query).count()
    items = await Employee.find(query).skip(pagination.skip).limit(pagination.limit).sort("full_name").to_list()

    return {
        "items": items,
        "total": total,
        "page": pagination.page,
        "page_size": pagination.page_size,
        "total_pages": (total + pagination.page_size - 1) // pagination.page_size,
    }

@router.post("/", response_model=EmployeeResponse)
async def create_employee(
    emp_data: EmployeeCreate,
    current_user: Annotated[User, Depends(get_current_user)],
):
    employee = Employee(**emp_data.dict())
    await employee.create()
    return employee

@router.get("/{employee_id}", response_model=EmployeeResponse)
async def get_employee(
    employee_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
):
    employee = await Employee.get(employee_id)
    if not employee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")
    return employee

@router.put("/{employee_id}", response_model=EmployeeResponse)
async def update_employee(
    employee_id: str,
    update: EmployeeUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
):
    employee = await Employee.get(employee_id)
    if not employee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")
    for k, v in update.dict(exclude_unset=True).items():
        setattr(employee, k, v)
    employee.update_timestamp()
    await employee.save()
    return employee

@router.delete("/{employee_id}", response_model=MessageResponse)
async def delete_employee(
    employee_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
):
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only admins can delete employees")
    employee = await Employee.get(employee_id)
    if not employee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")
    await employee.delete()
    return {"message": "Employee deleted"}