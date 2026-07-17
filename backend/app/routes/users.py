from fastapi import APIRouter
from app.database.database import SessionLocal
from sqlalchemy import text

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


@router.get("/{user_id}")
def get_user(user_id: int):

    db = SessionLocal()

    user = db.execute(
        text("""
        SELECT
            id,
            full_name,
            email,
            role,
            account_status
        FROM users
        WHERE id = :user_id
        """),
        {
            "user_id": user_id
        }
    ).fetchone()

    if not user:
        return {
            "message": "User not found"
        }

    return {
        "id": user.id,
        "name": user.full_name,
        "email": user.email,
        "role": user.role,
        "status": user.account_status
    }


@router.get("/{user_id}/history")
def user_history(user_id: int):

    db = SessionLocal()

    attempts = db.execute(
        text("""
        SELECT
            id,
            quiz_type,
            total_questions,
            correct_answers,
            score_percentage,
            completed_at
        FROM quiz_attempts
        WHERE user_id = :user_id
        ORDER BY completed_at DESC
        """),
        {
            "user_id": user_id
        }
    ).fetchall()

    result = []

    for attempt in attempts:

        result.append({
            "attempt_id": attempt.id,
            "quiz_type": attempt.quiz_type,
            "total_questions": attempt.total_questions,
            "correct_answers": attempt.correct_answers,
            "score": float(attempt.score_percentage),
            "date": attempt.completed_at
        })

    return result


@router.get("/{user_id}/stats")
def user_stats(user_id: int):

    db = SessionLocal()

    stats = db.execute(
        text("""
        SELECT
            COUNT(*) as quizzes,
            COALESCE(SUM(correct_answers), 0) as correct,
            COALESCE(SUM(incorrect_answers), 0) as incorrect,
            COALESCE(AVG(score_percentage), 0) as average_score
        FROM quiz_attempts
        WHERE user_id = :user_id
        """),
        {
            "user_id": user_id
        }
    ).fetchone()

    return {
        "quizzes_taken": stats.quizzes,
        "correct_answers": stats.correct,
        "incorrect_answers": stats.incorrect,
        "average_score": round(float(stats.average_score), 2)
    }


@router.get("/{user_id}/subscription")
def get_subscription(user_id: int):

    db = SessionLocal()

    sub = db.execute(
        text("""
        SELECT
            plan_name,
            start_date,
            end_date,
            active
        FROM subscriptions
        WHERE user_id = :user_id
        ORDER BY id DESC
        LIMIT 1
        """),
        {
            "user_id": user_id
        }
    ).fetchone()

    if not sub:
        return {
            "active": False
        }

    return {
        "plan": sub.plan_name,
        "start_date": sub.start_date,
        "end_date": sub.end_date,
        "active": sub.active
    }