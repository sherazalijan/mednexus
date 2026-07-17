from fastapi import APIRouter
from app.database.database import SessionLocal
from app.models.chapter import Chapter

router = APIRouter()


@router.get("/books/{book_id}/chapters")
def get_chapters(book_id: int):

    db = SessionLocal()

    chapters = (
        db.query(Chapter)
        .filter(Chapter.book_id == book_id)
        .all()
    )

    return chapters