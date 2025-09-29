from aiogram import Bot, Dispatcher

from config import bot_settings
from handlers.start import router as rt
import asyncio




async def main():
    bot = Bot(token=bot_settings.BOT_TOKEN)
    
    # Принудительно отключаем webhook, чтобы избежать конфликтов с polling
    try:
        await bot.delete_webhook(drop_pending_updates=True)
        print("Webhook отключен успешно")
    except Exception as e:
        print(f"Ошибка при отключении webhook: {e}")
    
    # Дополнительно очищаем webhook через API
    import httpx
    try:
        async with httpx.AsyncClient() as client:
            await client.post(f"https://api.telegram.org/bot{bot_settings.BOT_TOKEN}/setWebhook?url=")
            print("Webhook очищен через API")
    except Exception as e:
        print(f"Ошибка при очистке webhook через API: {e}")
    
    dp = Dispatcher()
    dp.include_router(rt)
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
