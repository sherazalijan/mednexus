from fastapi import APIRouter
from app.database.database import SessionLocal
from sqlalchemy import text
from pydantic import BaseModel

router = APIRouter(
    prefix="/quiz",
    tags=["Quiz"]
)


class QuizAnswer(BaseModel):
    mcq_id: int
    selected_answer: str


class QuizSubmission(BaseModel):
    user_id: int
    answers: list[QuizAnswer]


@router.get("/random/{count}")
def random_quiz(count: int):

    db = SessionLocal()

    mcqs = db.execute(
        text(f"""
        SELECT
    id,
    question,
    option_a,
    option_b,
    option_c,
    option_d,
    correct_answer,
    explanation
FROM mcqs
        ORDER BY RANDOM()
        LIMIT {count}
        """)
    ).fetchall()

    result = []

    for mcq in mcqs:
        result.append({
    "id": mcq.id,
    "question": mcq.question,
    "option_a": mcq.option_a,
    "option_b": mcq.option_b,
    "option_c": mcq.option_c,
    "option_d": mcq.option_d,
    "correct_answer": mcq.correct_answer,
    "explanation": mcq.explanation
})

    return result


@router.post("/submit")
def submit_quiz(data: QuizSubmission):

    db = SessionLocal()

    correct = 0

    results = []

    for answer in data.answers:

        mcq = db.execute(
            text("""
            SELECT
                id,
                question,
                correct_answer,
                explanation
            FROM mcqs
            WHERE id = :id
            """),
            {
                "id": answer.mcq_id
            }
        ).fetchone()

        if not mcq:
            continue

        is_correct = (
            mcq.correct_answer.upper()
            ==
            answer.selected_answer.upper()
        )

        if is_correct:
            correct += 1

        results.append({
            "mcq_id": mcq.id,
            "question": mcq.question,
            "your_answer": answer.selected_answer,
            "correct_answer": mcq.correct_answer,
            "is_correct": is_correct,
            "explanation": mcq.explanation
        })

    total = len(results)

    score = 0

    if total > 0:
        score = round(
            (correct / total) * 100,
            2
        )

    db.execute(
        text("""
        INSERT INTO quiz_attempts (
            user_id,
            quiz_type,
            total_questions,
            correct_answers,
            incorrect_answers,
            score_percentage,
            started_at,
            completed_at
        )
        VALUES (
            :user_id,
            'random',
            :total,
            :correct,
            :incorrect,
            :score,
            NOW(),
            NOW()
        )
        """),
        {
            "user_id": data.user_id,
            "total": total,
            "correct": correct,
            "incorrect": total - correct,
            "score": score
        }
    )

    db.commit()

    return {
        "total_questions": total,
        "correct": correct,
        "incorrect": total - correct,
        "score": score,
        "results": results
    }

    total = len(results)

    score = 0

    if total > 0:
        score = round(
            (correct / total) * 100,
            2
        )

    return {
        "total_questions": total,
        "correct": correct,
        "incorrect": total - correct,
        "score": score,
        "results": results
    }
