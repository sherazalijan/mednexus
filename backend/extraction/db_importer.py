import traceback
from sqlalchemy import text
from app.database.database import SessionLocal

def save_mcqs_to_db(mcqs, chapter_id, page_number):
    db = SessionLocal()
    saved_count = 0

    try:
        for mcq in mcqs:
            # 1. Clean and safely format parameters
            params = {
                "chapter_id": int(chapter_id),
                "question": mcq.get("question", "").strip(),
                "option_a": mcq.get("option_a") or "",
                "option_b": mcq.get("option_b") or "",
                "option_c": mcq.get("option_c") or "",
                "option_d": mcq.get("option_d") or "",
                "correct_answer": (mcq.get("correct_answer") or "").strip()[:1],
                "explanation": mcq.get("explanation") or "",
                "page_number": int(page_number)
            }

            # Skip processing if the question itself came back empty from Gemini
            if not params["question"]:
                print("Skipping an MCQ because the question text is empty.")
                continue

            # 2. Execute the single insert statement with valid single dictionary syntax
            result = db.execute(
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
                DO NOTHING;
                """),
                params
            )
            
            # Keeps track of how many rows were actually inserted vs skipped by ON CONFLICT
            if result.rowcount > 0:
                saved_count += 1

        # 3. Commit the entire batch transaction
        db.commit()
        print(f"Successfully inserted {saved_count} new MCQs out of {len(mcqs)} extracted on page {page_number}.")

    except Exception as e:
        db.rollback()
        print(f"Database error on page {page_number}: {e}")
        traceback.print_exc()

    finally:
        db.close()