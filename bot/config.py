from pydantic_settings import BaseSettings


class BotSettings(BaseSettings):
    BOT_TOKEN: str
    WEB_APP_URL: str

    class Config:
        env_file = ".env"


bot_settings = BotSettings() # type: ignore
