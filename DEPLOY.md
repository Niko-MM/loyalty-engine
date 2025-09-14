# 🚀 Руководство по деплою

## Подготовка сервера

### 1. Обновление системы
```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Установка Python 3.11+
```bash
sudo apt install python3.11 python3.11-venv python3.11-dev -y
```

### 3. Установка PostgreSQL
```bash
sudo apt install postgresql postgresql-contrib -y
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 4. Создание базы данных
```bash
sudo -u postgres psql
CREATE DATABASE loyalty_db;
CREATE USER loyalty_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE loyalty_db TO loyalty_user;
\q
```

### 5. Установка Nginx
```bash
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 6. Установка Certbot (SSL)
```bash
sudo apt install certbot python3-certbot-nginx -y
```

## Деплой приложения

### 1. Клонирование репозитория
```bash
cd /var/www
sudo git clone <your-repo-url> loyalty-app
sudo chown -R www-data:www-data loyalty-app
```

### 2. Настройка виртуального окружения
```bash
cd loyalty-app
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 3. Настройка переменных окружения
```bash
cp env.example .env
nano .env
# Отредактируйте настройки под ваш сервер
```

### 4. Запуск миграций
```bash
cd backend
alembic upgrade head
```

### 5. Создание systemd сервиса для бэкенда
```bash
sudo nano /etc/systemd/system/loyalty-backend.service
```

Содержимое файла:
```ini
[Unit]
Description=Loyalty Backend API
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/loyalty-app/backend
Environment=PATH=/var/www/loyalty-app/venv/bin
ExecStart=/var/www/loyalty-app/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
```

### 6. Создание systemd сервиса для бота
```bash
sudo nano /etc/systemd/system/loyalty-bot.service
```

Содержимое файла:
```ini
[Unit]
Description=Loyalty Telegram Bot
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/loyalty-app/bot
Environment=PATH=/var/www/loyalty-app/venv/bin
ExecStart=/var/www/loyalty-app/venv/bin/python main.py
Restart=always

[Install]
WantedBy=multi-user.target
```

### 7. Запуск сервисов
```bash
sudo systemctl daemon-reload
sudo systemctl enable loyalty-backend
sudo systemctl enable loyalty-bot
sudo systemctl start loyalty-backend
sudo systemctl start loyalty-bot
```

## Настройка Nginx

### 1. Создание конфигурации сайта
```bash
sudo nano /etc/nginx/sites-available/loyalty-app
```

Содержимое файла:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Frontend static files
    location / {
        root /var/www/loyalty-app/frontend;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend routes
    location /users/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /transactions/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /webhook/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 2. Активация сайта
```bash
sudo ln -s /etc/nginx/sites-available/loyalty-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Настройка SSL

### 1. Получение сертификата
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### 2. Автоматическое обновление
```bash
sudo crontab -e
# Добавьте строку:
0 12 * * * /usr/bin/certbot renew --quiet
```

## Мониторинг и логи

### 1. Просмотр логов сервисов
```bash
sudo journalctl -u loyalty-backend -f
sudo journalctl -u loyalty-bot -f
```

### 2. Просмотр логов Nginx
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 3. Мониторинг статуса сервисов
```bash
sudo systemctl status loyalty-backend
sudo systemctl status loyalty-bot
sudo systemctl status nginx
sudo systemctl status postgresql
```

## Обновление приложения

### 1. Обновление кода
```bash
cd /var/www/loyalty-app
sudo git pull origin main
```

### 2. Обновление зависимостей
```bash
source venv/bin/activate
pip install -r requirements.txt
```

### 3. Запуск миграций
```bash
cd backend
alembic upgrade head
```

### 4. Перезапуск сервисов
```bash
sudo systemctl restart loyalty-backend
sudo systemctl restart loyalty-bot
```

## Резервное копирование

### 1. Скрипт бэкапа базы данных
```bash
sudo nano /usr/local/bin/backup-loyalty-db.sh
```

Содержимое:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/loyalty"
mkdir -p $BACKUP_DIR

pg_dump -h localhost -U loyalty_user loyalty_db > $BACKUP_DIR/loyalty_db_$DATE.sql
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
```

### 2. Настройка cron для бэкапов
```bash
sudo crontab -e
# Добавьте строку:
0 2 * * * /usr/local/bin/backup-loyalty-db.sh
```

## Безопасность

### 1. Настройка файрвола
```bash
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### 2. Обновление системы
```bash
sudo apt update && sudo apt upgrade -y
```

### 3. Регулярные бэкапы
- Настройте автоматические бэкапы базы данных
- Регулярно проверяйте логи на ошибки
- Обновляйте зависимости

## Устранение неполадок

### 1. Проверка статуса сервисов
```bash
sudo systemctl status loyalty-backend
sudo systemctl status loyalty-bot
```

### 2. Проверка логов
```bash
sudo journalctl -u loyalty-backend --since "1 hour ago"
sudo journalctl -u loyalty-bot --since "1 hour ago"
```

### 3. Проверка подключения к базе данных
```bash
sudo -u postgres psql -c "SELECT 1;"
```

### 4. Проверка портов
```bash
sudo netstat -tlnp | grep :8000
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :443
```
