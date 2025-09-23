from fastapi import APIRouter, HTTPException, Query
from app.repository.transaction import create_transaction, get_user_transactions
from app.repository.user import get_user_by_telegram_id, update_user_points
from app.schemas.transaction import TransactionCreate



router = APIRouter()


@router.post("/")
async def create_transaction_endpoint(transaction_data: TransactionCreate):
    try:
        user = await get_user_by_telegram_id(transaction_data.user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        transaction = await create_transaction(
            user_id=transaction_data.user_id,
            amount=transaction_data.amount,
            points_change=transaction_data.points_change,
            cafe_id=transaction_data.cafe_id,
        )

        update_user = await update_user_points(
            transaction_data.user_id, transaction_data.points_change
        )
        if not update_user:
            raise HTTPException(status_code=404, detail="User not found after update")

        return {
            "status": "success",
            "transaction_id": transaction.id,
            "new_balance": update_user.points,
        }
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/history")
async def get_transaction_history(user_id: int = Query(...)):
    try:
        user = await get_user_by_telegram_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        transactions = await get_user_transactions(user_id)

        return [
            {
                "id": tx.id,
                "amount": tx.amount,
                "points_change": tx.points_change,
                "created_at": tx.created_at,
                "cafe_id": tx.cafe_id,
            }
            for tx in transactions
        ]
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))
