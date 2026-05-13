"""
Auth routes - register and login.
Login is mostly handled on frontend with Supabase JS, but we expose
a register endpoint to also create a profile row with role.
"""
from fastapi import APIRouter, HTTPException
from app.models.schemas import RegisterRequest, LoginRequest
from app.supabase_client import supabase, supabase_admin

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register")
def register(payload: RegisterRequest):
    """
    Creates a Supabase auth user AND inserts a profile row with chosen role.
    """
    # Validate role
    if payload.role not in ["firm_admin", "team_member", "client"]:
        raise HTTPException(status_code=400, detail="Invalid role")

    try:
        # Step 1: Create auth user
        auth_response = supabase_admin.auth.admin.create_user({
            "email": payload.email,
            "password": payload.password,
            "email_confirm": True  # auto-confirm for MVP
        })

        user_id = auth_response.user.id

        # Step 2: Insert profile row
        supabase_admin.table("profiles").insert({
            "id": user_id,
            "email": payload.email,
            "full_name": payload.full_name,
            "role": payload.role
        }).execute()

        return {"message": "Registered successfully", "user_id": user_id}

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login")
def login(payload: LoginRequest):
    """
    Login endpoint. Returns access token and user profile.
    (Frontend usually calls Supabase JS directly — this is a backup.)
    """
    try:
        response = supabase.auth.sign_in_with_password({
            "email": payload.email,
            "password": payload.password
        })

        # Get profile info (role)
        profile = supabase_admin.table("profiles") \
            .select("*") \
            .eq("id", response.user.id) \
            .single() \
            .execute()

        return {
            "access_token": response.session.access_token,
            "user": profile.data
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))
