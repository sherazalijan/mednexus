from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Load SQLAlchemy models first
from app.models.book import Book
from app.models.chapter import Chapter
from app.models.mcq import MCQ
from app.models.user import User

from app.routes.auth import router as auth_router
from app.routes.books import router as books_router
from app.routes.chapters import router as chapters_router
from app.routes.quiz import router as quiz_router
from app.routes.users import router as users_router
from app.routes.admin import router as admin_router

app = FastAPI(
    title="SK23 MCQ Platform"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # Matches the URL your Vite app is running on
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Allows all headers
)
# CORS


app.include_router(auth_router)
app.include_router(books_router)
app.include_router(chapters_router)
app.include_router(quiz_router)
app.include_router(users_router)
app.include_router(admin_router)

@app.get("/")
def home():
    return {
        "message": "SK23 Backend Running"
    }