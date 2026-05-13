"""
Pydantic schemas for request/response validation.
"""
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date, datetime
from uuid import UUID

# ---------- AUTH ----------
class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: str  # 'firm_admin', 'team_member', or 'client'

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

# ---------- JOBS ----------
class JobCreate(BaseModel):
    title: str
    description: Optional[str] = None
    client_id: Optional[str] = None
    assigned_to: Optional[str] = None
    due_date: Optional[date] = None

class JobUpdate(BaseModel):
    status: Optional[str] = None
    assigned_to: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None

class JobResponse(BaseModel):
    id: str
    title: str
    description: Optional[str]
    status: str
    assigned_to: Optional[str]
    client_id: Optional[str]
    due_date: Optional[date]
    created_at: datetime
