"""
FastAPI application entry point.
Run with: uvicorn app.main:app --reload
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, jobs, documents, clients

# Create FastAPI app
app = FastAPI(title="CA Firm SaaS API", version="1.0.0")

# Enable CORS so React frontend (localhost:3000) can call this API (localhost:8000)
app.add_middleware(
    CORSMiddleware,
allow_origins=["https://zucchini-reflection-production-acad.up.railway.app"],    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all route modules
app.include_router(auth.router)
app.include_router(jobs.router)
app.include_router(documents.router)
app.include_router(clients.router)

@app.get("/")
def root():
    return {"message": "CA Firm SaaS API running"}
