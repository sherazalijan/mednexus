from sqlalchemy import Column, Integer, String, TIMESTAMP
from sqlalchemy.sql import func
from app.database.base import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)

    full_name = Column(String(255))

    email = Column(String(255), unique=True)

    password = Column(String(255))

    role = Column(String(20))

    account_status = Column(String(20))

    created_at = Column(
        TIMESTAMP,
        server_default=func.now()
    )