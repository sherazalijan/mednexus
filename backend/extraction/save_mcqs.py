from sqlalchemy import text
from app.database.database import SessionLocal
import traceback


def save_mcqs_to_db(mcqs, chapter_id, page_number):

    db = SessionLocal()

    try:

        for mcq in mcqs:

            db.execute(
                text("""
                INSERT INTO mcqs (
                    chapter_id,
                    question,
                    option_a,
                    option_b,
                    option_c,
                    option_d,
                    correct_answer,
                    explanation,
                    page_number
                )
                VALUES (
                    :chapter_id,
                    :question,
                    :option_a,
                    :option_b,
                    :option_c,
                    :option_d,
                    :correct_answer,
                    :explanation,
                    :page_number
                )
                ON CONFLICT (question)
                DO NOTHING
                """),
                {
                    "chapter_id": chapter_id,
                    "question": mcq.get("question", ""),
                    "option_a": mcq.get("option_a") or "",
                    "option_b": mcq.get("option_b") or "",
                    "option_c": mcq.get("option_c") or "",
                    "option_d": mcq.get("option_d") or "",
                    "correct_answer": (mcq.get("correct_answer") or "")[:1],
                    "explanation": mcq.get("explanation") or "",
                    "page_number": page_number
                }
            )

        db.commit()

        print(f"Saved {len(mcqs)} MCQs to database")

    except Exception:
        db.rollback()
        traceback.print_exc()

    finally:
        db.close()