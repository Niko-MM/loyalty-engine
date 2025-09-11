from app.database.session import Base
from sqlalchemy import Column, Integer, BigInteger, DateTime, ForeignKey
from datetime import datetime, timezone


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True)
    user_id = Column(BigInteger, ForeignKey("users.telegram_id"))
    amount = Column(Integer)
    points_change = Column(Integer)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    cafe_id = Column(Integer, nullable=False)
