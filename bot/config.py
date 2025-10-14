from pydantic_settings import BaseSettings, SettingsConfigDict


class BotSettings(BaseSettings):
    BOT_TOKEN: str
    WEB_APP_URL: str

    model_config = SettingsConfigDict(env_file=".env")


bot_settings = BotSettings() # type: ignore
