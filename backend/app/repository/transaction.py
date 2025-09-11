from app.database.session import async_session_maker
from app.tables.transaction import Transaction
from sqlalchemy import select


async def create_transaction(
    amount: int, user_id: int, points_change: int, cafe_id: int
):
    async with async_session_maker() as session:
        transaction = Transaction(
            amount=amount,
            user_id=user_id,
            points_change=points_change,
            cafe_id=cafe_id,
        )
        session.add(transaction)
        await session.commit()
        await session.refresh(transaction)

        return transaction


async def get_user_transactions(user_id: int):
    async with async_session_maker() as session:
        query = select(Transaction).where(Transaction.user_id == user_id)
        result = await session.execute(query)
        return result.scalars().all()


async def get_transaction_by_id(transaction_id: int):
    async with async_session_maker() as session:
        query = select(Transaction).where(Transaction.id == transaction_id)
        result = await session.execute(query)
        return result.scalar_one_or_none()
