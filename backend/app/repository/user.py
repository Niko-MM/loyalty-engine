from app.tables.user import User
from app.database.session import async_session_maker
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError


async def create_user(telegram_id: int, nick_name: str, qr_code: str):
    async with async_session_maker() as session:
        user = User(telegram_id=telegram_id, nick_name=nick_name, qr_code=qr_code)
        session.add(user)
        try:
            await session.commit()
            await session.refresh(user)
            return user
        except IntegrityError:
            await session.rollback()
            return None


async def get_user_by_telegram_id(telegram_id: int):
    async with async_session_maker() as session:
        query = select(User).where(User.telegram_id == telegram_id)
        result = await session.execute(query)
        return result.scalar_one_or_none()


async def update_user_points(telegram_id: int, points: int):
    async with async_session_maker() as session:
        query = select(User).where(User.telegram_id == telegram_id)
        result = await session.execute(query)
        user = result.scalar_one_or_none()

        if not user:
            return None

        if user.points + points < 0: # type: ignore
            raise ValueError("Недостаточно баллов для списания")

        user.points += points # type: ignore
        await session.commit()
        await session.refresh(user)

        return user
