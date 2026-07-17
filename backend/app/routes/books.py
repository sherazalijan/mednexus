from fastapi import APIRouter
from app.database.database import SessionLocal
from app.models.book import Book

router = APIRouter()

@router.get("/books")
def get_books():

    db = SessionLocal()

    books = db.query(Book).all()

    return books