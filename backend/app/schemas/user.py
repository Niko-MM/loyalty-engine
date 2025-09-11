from pydantic import BaseModel


class UserIn(BaseModel):
    telegram_id: int
    nick_name: str


class UserProfileRequest(BaseModel):
    telegram_id: int


class UserOut(BaseModel):
    id: int
    qr_code: str
    points: int
    nick_name: str

    class Config:
        from_attributes = True


class UserCreate(BaseModel):
    pass
