from fastapi import APIRouter
from app.database.database import SessionLocal
from sqlalchemy import text

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

from app.models.schemas import LoginRequest

@router.post("/login")
def login(data: LoginRequest):

    email = data.email
    password = data.password

    db = SessionLocal()

    user = db.execute(
        text("""
        SELECT *
        FROM users
        WHERE email=:email
        AND password_hash=:password
        AND account_status='active'
        """),
        {
            "email": email,
            "password": password
        }
    ).fetchone()

    if not user:
        return {
            "success": False,
            "message": "Invalid credentials"
        }

    return {
        "success": True,
        "user_id": user.id,
        "name": user.full_name,
        "role": user.role
    }