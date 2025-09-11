from pydantic import BaseModel, Field


class TransactionCreate(BaseModel):
    user_id: int
    cafe_id: int = Field(gt=0)
    points_change: int
    amount: int = Field(ge=0)


class TransactionOut(BaseModel):
    status: str

    class Config:
        from_attributes = True

