from fastapi import APIRouter, HTTPException, status
from app.repository.transaction import create_transaction
from app.repository.user import update_user_points, get_user_by_telegram_id

router = APIRouter()


@router.post("/transaction")
async def handle_transaction_webhook(data: dict):
    try:
        user_id = data["user_id"]
        amount = data["amount"]
        discount_used = data["discount_used"]
        cafe_id = data["cafe_id"]
        points_change = 0

        user = await get_user_by_telegram_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
            )

        if discount_used > 0:
            points_change = -discount_used
        else:
            points_change = int(amount * 0.1)

        balance_after = user.points + points_change
        if balance_after < 0:  # type: ignore
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Not enough points"
            )

        updated_user = await update_user_points(user_id, points_change)
        if not updated_user:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update user points",
            )

        transaction = await create_transaction(
            amount=amount, user_id=user_id, points_change=points_change, cafe_id=cafe_id
        )

        return {
            "status": "success",
            "points_change": points_change,
            "new_balance": updated_user.points,
            "transaction_id": transaction.id,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error{e}",
        )
