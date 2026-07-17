from sqlalchemy import text
from app.database.database import SessionLocal


def get_or_create_chapter(book_id, chapter_name):

    db = SessionLocal()

    try:

        result = db.execute(
            text("""
            SELECT id
            FROM chapters
            WHERE book_id = :book_id
            AND chapter_name = :chapter_name
            """),
            {
                "book_id": book_id,
                "chapter_name": chapter_name
            }
        ).fetchone()

        if result:
            return result[0]

        db.execute(
            text("""
            INSERT INTO chapters (
                book_id,
                chapter_name
            )
            VALUES (
                :book_id,
                :chapter_name
            )
            """),
            {
                "book_id": book_id,
                "chapter_name": chapter_name
            }
        )

        db.commit()

        result = db.execute(
            text("""
            SELECT id
            FROM chapters
            WHERE book_id = :book_id
            AND chapter_name = :chapter_name
            """),
            {
                "book_id": book_id,
                "chapter_name": chapter_name
            }
        ).fetchone()

        return result[0]

    finally:
        db.close()
        