"""
Document upload/download routes.
Files are stored in Supabase Storage bucket 'job-documents'.
"""
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from app.supabase_client import supabase_admin
from app.dependencies import get_current_user
import uuid

router = APIRouter(prefix="/documents", tags=["documents"])

BUCKET_NAME = "job-documents"

@router.post("/upload")
async def upload_document(
    job_id: str = Form(...),
    file: UploadFile = File(...),
    user=Depends(get_current_user)
):
    """
    Upload a file linked to a job.
    1. Read file bytes
    2. Push to Supabase Storage
    3. Save record in 'documents' table
    """
    try:
        # Build a unique storage path: job_id/uuid_filename
        unique_name = f"{uuid.uuid4()}_{file.filename}"
        storage_path = f"{job_id}/{unique_name}"

        # Read file content
        contents = await file.read()

        # Upload to Supabase Storage
        supabase_admin.storage.from_(BUCKET_NAME).upload(
            path=storage_path,
            file=contents,
            file_options={"content-type": file.content_type}
        )

        # Insert metadata into documents table
        doc = supabase_admin.table("documents").insert({
            "job_id": job_id,
            "file_name": file.filename,
            "file_path": storage_path,
            "uploaded_by": user.id
        }).execute()

        return doc.data[0]

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/job/{job_id}")
def list_documents(job_id: str, user=Depends(get_current_user)):
    """List all documents for a given job, with signed URLs to download."""
    docs = supabase_admin.table("documents").select("*").eq("job_id", job_id).execute()

    # Generate signed URLs (valid for 1 hour) so frontend can download
    for d in docs.data:
        signed = supabase_admin.storage.from_(BUCKET_NAME).create_signed_url(
            d["file_path"], 3600
        )
        d["signed_url"] = signed.get("signedURL") or signed.get("signed_url")

    return docs.data
