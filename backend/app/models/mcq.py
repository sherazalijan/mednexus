from sqlalchemy import (
    Column,
    Integer,
    Text,
    CHAR,
    ForeignKey,
    TIMESTAMP
)

from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database.base import Base

class MCQ(Base):
    __tablename__ = "mcqs"

    id = Column(Integer, primary_key=True, index=True)

    chapter_id = Column(Integer, ForeignKey("chapters.id"))

    question = Column(Text, nullable=False)

    option_a = Column(Text, nullable=False)
    option_b = Column(Text, nullable=False)
    option_c = Column(Text, nullable=False)
    option_d = Column(Text, nullable=False)

    correct_answer = Column(CHAR(1), nullable=False)

    explanation = Column(Text)

    page_number = Column(Integer)

    created_at = Column(TIMESTAMP, server_default=func.now())

    chapter = relationship("Chapter", back_populates="mcqs")