from app.database.session import Base
from sqlalchemy import Column, Integer, String, BigInteger


class User(Base):
    __tablename__ = "users"

    telegram_id = Column(BigInteger, primary_key=True)
    nick_name = Column(String(100), nullable=False)
    points = Column(Integer, nullable=False, default=0)
    qr_code = Column(String, nullable=False)
