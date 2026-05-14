import os
from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from database import init_db, get_db, Signup

app = FastAPI(title="The Oracle Backend")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Database on startup
@app.on_event("startup")
def startup_event():
    init_db()

class SignupCreate(BaseModel):
    value: str

class SignupResponse(BaseModel):
    id: int
    value: str
    timestamp: str

    class Config:
        from_attributes = True

@app.post("/api/signup")
def create_signup(signup: SignupCreate, db: Session = Depends(get_db)):
    db_signup = Signup(value=signup.value)
    db.add(db_signup)
    db.commit()
    db.refresh(db_signup)
    return {"status": "success", "id": db_signup.id}

@app.get("/api/admin/signups")
def get_signups(x_admin_password: str = Header(None), db: Session = Depends(get_db)):
    admin_password = os.getenv("ADMIN_PASSWORD", "oracle-secret")
    if x_admin_password != admin_password:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    signups = db.query(Signup).order_by(Signup.timestamp.desc()).all()
    return signups

@app.get("/api/health")
def health_check():
    return {"status": "healthy"}
