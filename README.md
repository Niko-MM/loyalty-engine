# 🎯 Система лояльности для кафе

Telegram WebApp для управления программой лояльности с интеграцией в кассовые системы.

## 🚀 Возможности

- **Telegram WebApp** - удобный интерфейс для клиентов
- **QR-коды** - быстрая идентификация клиентов
- **Система баллов** - начисление и списание баллов
- **Интеграция с кассой** - автоматическое начисление баллов
- **PWA поддержка** - добавление на главный экран
- **История транзакций** - отслеживание покупок

## 🏗️ Архитектура

```
good_luck/
├── backend/          # FastAPI сервер
│   ├── app/
│   │   ├── api/      # API эндпоинты
│   │   ├── config/   # Конфигурация
│   │   ├── database/ # Подключение к БД
│   │   ├── repository/ # Работа с данными
│   │   ├── schemas/  # Pydantic модели
│   │   └── tables/   # SQLAlchemy модели
│   ├── alembic/      # Миграции БД
│   └── main.py       # Точка входа
├── bot/              # Telegram бот
│   ├── handlers/     # Обработчики команд
│   └── main.py       # Точка входа
├── frontend/         # WebApp интерфейс
│   ├── public/       # Статические файлы
│   ├── index.html    # Главная страница
│   ├── app.js        # JavaScript логика
│   └── manifest.json # PWA манифест
└── requirements.txt  # Зависимости Python
```

## 🛠️ Технологии

### Backend
- **FastAPI** - веб-фреймворк
- **SQLAlchemy** - ORM
- **PostgreSQL** - база данных
- **Alembic** - миграции
- **Pydantic** - валидация данных

### Bot
- **Aiogram 3.x** - Telegram Bot API

### Frontend
- **Vanilla JavaScript** - без фреймворков
- **Telegram WebApp API** - интеграция с Telegram
- **PWA** - прогрессивное веб-приложение

## 📦 Установка

1. **Клонирование репозитория**
```bash
git clone <repository-url>
cd good_luck
```

2. **Создание виртуального окружения**
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# или
venv\Scripts\activate     # Windows
```

3. **Установка зависимостей**
```bash
pip install -r requirements.txt
```

4. **Настройка переменных окружения**
```bash
cp .env.example .env
# Отредактируйте .env файл
```

5. **Настройка базы данных**
```bash
# Создайте PostgreSQL базу данных
# Обновите настройки в .env
```

6. **Запуск миграций**
```bash
cd backend
alembic upgrade head
```

## 🚀 Запуск

### Backend
```bash
cd backend
python main.py
# или
uvicorn main:app --reload
```

### Bot
```bash
cd bot
python main.py
```

### Frontend
Откройте `frontend/index.html` в браузере или настройте веб-сервер для статических файлов.

## 🔧 Конфигурация

### Переменные окружения (.env)
```env
# Database
DB_USER=your_db_user
DB_PASS=your_db_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=loyalty_db

# Telegram Bot
BOT_TOKEN=your_bot_token
WEBHOOK_URL=https://yourdomain.com/webhook

# API
API_HOST=0.0.0.0
API_PORT=8000
```

## 📱 Использование

1. **Для клиентов:**
   - Откройте бота в Telegram
   - Нажмите "Открыть приложение"
   - Покажите QR-код кассиру для начисления баллов

2. **Для администраторов:**
   - Используйте API для интеграции с кассой
   - Настройте вебхуки для автоматического начисления баллов

## 🔌 API

### Основные эндпоинты

- `POST /users/init/` - регистрация пользователя
- `POST /users/profile` - получение профиля пользователя
- `POST /transactions/transactions` - создание транзакции
- `GET /transactions/history` - история транзакций
- `POST /webhook/webhook/transaction` - вебхук для кассы

## 🚀 Деплой

### На сервер
1. Настройте PostgreSQL
2. Установите зависимости
3. Запустите миграции
4. Настройте веб-сервер (Nginx/Caddy)
5. Настройте SSL сертификат
6. Запустите приложение

### Docker (планируется)
```bash
docker-compose up -d
```

## 📈 Планы развития

- [ ] Интеграция с популярными кассовыми системами
- [ ] Админ-панель для управления
- [ ] Система акций и скидок
- [ ] Аналитика и отчеты
- [ ] Мобильное приложение
- [ ] Мультиязычность

## 🤝 Вклад в проект

1. Форкните репозиторий
2. Создайте ветку для новой функции
3. Внесите изменения
4. Создайте Pull Request

## 📄 Лицензия

MIT License

## 📞 Поддержка

Если у вас есть вопросы или предложения, создайте Issue в репозитории.

---

**Автор:** [Ваше имя]  
**Версия:** 1.0.0  
**Дата:** 2025
