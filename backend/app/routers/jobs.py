"""
Job/Task management routes.
"""
from fastapi import APIRouter, Depends, HTTPException
from app.models.schemas import JobCreate, JobUpdate
from app.supabase_client import supabase_admin
from app.dependencies import get_current_user

router = APIRouter(prefix="/jobs", tags=["jobs"])

@router.get("/")
def list_jobs(user=Depends(get_current_user)):
    """
    Returns jobs based on the user's role:
    - firm_admin: all jobs
    - team_member: only jobs assigned to them
    - client: only jobs where they are the client
    """
    # Get user profile to know role
    profile_res = supabase_admin.table("profiles").select("*").eq("id", user.id).single().execute()
    profile = profile_res.data
    role = profile["role"]

    query = supabase_admin.table("jobs").select("*")

    if role == "team_member":
        query = query.eq("assigned_to", user.id)
    elif role == "client":
        query = query.eq("client_id", user.id)
    # firm_admin sees everything

    result = query.order("created_at", desc=True).execute()
    return result.data


@router.post("/")
def create_job(payload: JobCreate, user=Depends(get_current_user)):
    """
    Create a new job. Only firm_admin should do this (enforce in production).
    """
    data = {
        "title": payload.title,
        "description": payload.description,
        "client_id": payload.client_id,
        "assigned_to": payload.assigned_to,
        "due_date": str(payload.due_date) if payload.due_date else None,
        "created_by": user.id,
        "status": "pending"
    }
    result = supabase_admin.table("jobs").insert(data).execute()
    return result.data[0]


@router.get("/{job_id}")
def get_job(job_id: str, user=Depends(get_current_user)):
    """Get single job by ID."""
    result = supabase_admin.table("jobs").select("*").eq("id", job_id).single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Job not found")
    return result.data


@router.patch("/{job_id}")
def update_job(job_id: str, payload: JobUpdate, user=Depends(get_current_user)):
    """Update job (e.g., change status, reassign)."""
    update_data = {k: v for k, v in payload.dict().items() if v is not None}
    result = supabase_admin.table("jobs").update(update_data).eq("id", job_id).execute()
    return result.data[0] if result.data else {}


@router.get("/users/team")
def list_team_members(user=Depends(get_current_user)):
    """Returns list of team members to assign jobs to."""
    result = supabase_admin.table("profiles").select("id, full_name, email, role").execute()
    return result.data
