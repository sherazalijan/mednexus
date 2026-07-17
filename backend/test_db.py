from app.database.database import SessionLocal
from sqlalchemy import text

db = SessionLocal()

try:
    result = db.execute(text("SELECT version();"))
    print(result.fetchone())
finally:
    db.close()
    