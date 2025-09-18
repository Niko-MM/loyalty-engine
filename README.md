# Bonus Engine

Система лояльности для ресторанов и кафе с интеграцией через Telegram WebApp.

## О проекте

Bonus Engine решает проблему низкой клиентской лояльности в сфере HoReCa через современный подход к программе лояльности. Вместо традиционных пластиковых карт клиенты используют QR-код в Telegram, а кассиры сканируют его для автоматического начисления баллов.

## Технологии

- **Backend**: FastAPI + SQLAlchemy + PostgreSQL
- **Bot**: Aiogram 3.x + Telegram WebApp
- **Frontend**: Vanilla JavaScript + PWA
- **Deploy**: Nginx + systemd

## Структура

```
bonus-engine/
├── backend/          # FastAPI приложение
├── bot/             # Telegram бот
├── frontend/        # WebApp интерфейс
├── nginx.conf       # Nginx конфигурация
├── deploy.sh        # Скрипт деплоя
└── requirements.txt # Python зависимости
```

## Быстрый старт

### Локальная разработка
```bash
# Клонирование и настройка
git clone <repository-url>
cd bonus-engine
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Настройка базы данных
cp env.example .env
# Отредактируйте .env с настройками БД

# Миграции
cd backend && alembic upgrade head

# Запуск
cd backend && uvicorn main:app --reload
cd bot && python main.py
```

### Продакшен деплой
```bash
sudo ./deploy.sh
```

## API

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

### Основные эндпоинты
- `POST /users/init/` - регистрация пользователя
- `POST /users/profile` - профиль пользователя  
- `POST /transactions/` - создание транзакции
- `GET /transactions/history` - история транзакций
- `POST /webhook/transaction` - вебхук для интеграции

## Лицензия

MIT License
