from aiogram import Router
from aiogram.filters import Command
from aiogram.types import Message, FSInputFile
import httpx


router = Router()


@router.message(Command("start"))
async def start_handler(msg: Message):
    if not msg.from_user:
        await msg.answer("Не удалось определить пользователя.")
        return

    telegram_id = msg.from_user.id
    nick_name = msg.from_user.username or f"user{msg.from_user.id}"
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "http://127.0.0.1:8000/users/init/",
                json={
                    "telegram_id": str(telegram_id),
                    "nick_name": nick_name,
                },
                timeout=10.0,
            )
            photo = FSInputFile("bot/assets/welcome.jpg")
            await msg.answer_photo(photo=photo)
            await msg.answer(
                f'🎉 Привет, {msg.from_user.username or "друг"}!\n\n'
                'Добро пожаловать в TastyLab!\n'
                'Ваша карта лояльности готова!\n\n'
                'Здесь вы можете:\n'
                '• Посмотреть баланс баллов\n'
                '• Изучить историю покупок\n'
                '• Узнать об акциях\n'
                '• Найти ближайшее кафе\n\n'
                ' Нажмите на кнопку "Открыть карту лояльности" как показано на картинке выше!'
            )
            if response.status_code == 500:
                await msg.answer("⚠️ Что-то пошло не так. Попробуйте позже.")
    except httpx.TimeoutException:
        await msg.answer("⏳ Сервер не отвечает. Попробуйте через минуту.")
    except httpx.RequestError as e:
        await msg.answer(f"🔌 Ошибка подключения: {str(e)}")
    except Exception as e:
        await msg.answer(f"❌ Неизвестная ошибка: {str(e)}")
