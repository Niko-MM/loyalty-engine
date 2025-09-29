from aiogram import Bot, Dispatcher

from config import bot_settings
from handlers.start import router as rt
import asyncio




async def main():
    bot = Bot(token=bot_settings.BOT_TOKEN)
    
    # Отключаем webhook, чтобы избежать конфликтов с polling
    await bot.delete_webhook(drop_pending_updates=True)
    
    dp = Dispatcher()
    dp.include_router(rt)
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
