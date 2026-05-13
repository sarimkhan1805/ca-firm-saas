"""
Client-specific routes (used by the client portal).
"""
from fastapi import APIRouter, Depends
from app.supabase_client import supabase_admin
from app.dependencies import get_current_user

router = APIRouter(prefix="/client", tags=["client"])

@router.get("/my-jobs")
def my_jobs(user=Depends(get_current_user)):
    """Returns only the jobs that belong to the logged-in client."""
    result = supabase_admin.table("jobs") \
        .select("*") \
        .eq("client_id", user.id) \
        .order("created_at", desc=True) \
        .execute()
    return result.data
