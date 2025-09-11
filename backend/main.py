from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.transactions import router as transactions_router
from app.api.users import router as user_router
from app.api.webhook import router as webhook_router


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user_router, prefix="/users", tags=["Users"])
app.include_router(transactions_router, prefix="/transactions", tags=["transactions"])
app.include_router(webhook_router, prefix="/webhook", tags=["webhook"])


@app.get("/")
async def main():
    return {"status": "working"}
