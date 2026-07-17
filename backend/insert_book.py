from app.database.database import SessionLocal
from sqlalchemy import text

db = SessionLocal()

try:
    db.execute(
        text("""
            INSERT INTO books (title, description)
            VALUES (:title, :description)
        """),
        {
            "title": "SK23",
            "description": "Medical MCQ Book"
        }
    )

    db.commit()

    print("Book inserted successfully!")

finally:
    db.close()