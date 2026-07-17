from fastapi import APIRouter
from app.database.database import SessionLocal
from sqlalchemy import text
from pydantic import BaseModel
router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)
class CreateUserRequest(BaseModel):
    full_name: str
    email: str
    password: str
    role: str = "student"

@router.get("/users")
def get_users():

    db = SessionLocal()

    users = db.execute(
        text("""
        SELECT
            id,
            full_name,
            email,
            role,
            account_status
        FROM users
        ORDER BY id
        """)
    ).fetchall()

    return [
        {
            "id": user.id,
            "name": user.full_name,
            "email": user.email,
            "role": user.role,
            "status": user.account_status
        }
        for user in users
    ]


@router.post("/create-user")
def create_user(data: CreateUserRequest):

    db = SessionLocal()

    db.execute(
        text("""
        INSERT INTO users (
            full_name,
            email,
            password_hash,
            role,
            account_status
        )
        VALUES (
            :full_name,
            :email,
            :password,
            :role,
            'active'
        )
        """),
        {
    "full_name": data.full_name,
    "email": data.email,
    "password": data.password,
    "role": data.role
}
    )

    db.commit()

    return {
        "success": True,
        "message": "User created"
    }


@router.post("/disable-user/{user_id}")
def disable_user(user_id: int):

    db = SessionLocal()

    db.execute(
        text("""
        UPDATE users
        SET account_status = 'disabled'
        WHERE id = :user_id
        """),
        {
            "user_id": user_id
        }
    )

    db.commit()

    return {
        "success": True,
        "message": "User disabled"
    }


@router.post("/create-subscription")
def create_subscription(data: dict):

    db = SessionLocal()

    db.execute(
        text("""
        INSERT INTO subscriptions (
            user_id,
            plan_name,
            start_date,
            end_date,
            active
        )
        VALUES (
            :user_id,
            :plan_name,
            NOW(),
            :end_date,
            TRUE
        )
        """),
        {
            "user_id": data["user_id"],
            "plan_name": data["plan_name"],
            "end_date": data["end_date"]
        }
    )

    db.commit()

    return {
        "success": True,
        "message": "Subscription created"
    }


@router.get("/leaderboard")
def leaderboard():

    db = SessionLocal()

    data = db.execute(
        text("""
        SELECT
            u.full_name,
            COUNT(q.id) AS quizzes,
            AVG(q.score_percentage) AS avg_score
        FROM users u
        JOIN quiz_attempts q
            ON u.id = q.user_id
        GROUP BY u.id, u.full_name
        ORDER BY avg_score DESC
        """)
    ).fetchall()

    return [
        {
            "name": row.full_name,
            "quizzes": row.quizzes,
            "average_score": round(float(row.avg_score), 2)
        }
        for row in data
    ]


@router.get("/dashboard")
def dashboard():

    db = SessionLocal()

    total_users = db.execute(
        text("SELECT COUNT(*) FROM users")
    ).scalar()

    active_users = db.execute(
        text("""
        SELECT COUNT(*)
        FROM users
        WHERE account_status='active'
        """)
    ).scalar()

    disabled_users = db.execute(
        text("""
        SELECT COUNT(*)
        FROM users
        WHERE account_status='disabled'
        """)
    ).scalar()

    total_mcqs = db.execute(
        text("SELECT COUNT(*) FROM mcqs")
    ).scalar()

    total_books = db.execute(
        text("SELECT COUNT(*) FROM books")
    ).scalar()

    total_attempts = db.execute(
        text("SELECT COUNT(*) FROM quiz_attempts")
    ).scalar()

    return {
        "total_users": total_users,
        "active_users": active_users,
        "disabled_users": disabled_users,
        "total_mcqs": total_mcqs,
        "total_books": total_books,
        "total_quiz_attempts": total_attempts
    }