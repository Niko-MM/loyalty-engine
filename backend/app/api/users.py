from fastapi import APIRouter, HTTPException, Query
from app.repository.user import get_user_by_telegram_id, create_user
from app.schemas.user import UserIn


router = APIRouter()


@router.post("/init")
async def init_user(user_: UserIn):
    try:
        existing_user = await get_user_by_telegram_id(user_.telegram_id)
        if existing_user:
            return {"status": "exists", "message": "User already exists"}
        else:
            qr_code = generate_qr_code(user_.telegram_id)
            new_user = await create_user(user_.telegram_id, user_.nick_name, qr_code)
            if not new_user:
                return {
                    "status": "exists",
                    "message": "User already exists (race condition handled)",
                }

            return {"status": "created", "message": "User created successfully"}
    except Exception as e:
        print(f"Registration error for {user_.telegram_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")


@router.get("/profile")
async def user_info(telegram_id: int = Query(...)):
    user = await get_user_by_telegram_id(telegram_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {"nick_name": user.nick_name, "points": user.points, "qr_code": user.qr_code}


def generate_qr_code(telegram_id):
    return f"user_{telegram_id}"
