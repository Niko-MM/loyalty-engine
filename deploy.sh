#!/bin/bash

set -e

echo "🚀 Deploying Bonus Engine..."

log() {
    echo -e "\033[0;32m[INFO]\033[0m $1"
}

warn() {
    echo -e "\033[1;33m[WARN]\033[0m $1"
}

error() {
    echo -e "\033[0;31m[ERROR]\033[0m $1"
}

if [ "$EUID" -ne 0 ]; then
    error "Run with sudo: sudo ./deploy.sh"
    exit 1
fi

PROJECT_DIR="/var/www/bonus-engine"
DOMAIN="yourdomain.com"
DB_NAME="bonus_engine_db"
DB_USER="bonus_engine_user"
DB_PASS=$(openssl rand -base64 32)

log "Обновляем систему..."
apt update && apt upgrade -y

log "Устанавливаем необходимые пакеты..."
apt install -y python3.11 python3.11-venv python3.11-dev postgresql postgresql-contrib nginx certbot python3-certbot-nginx ufw

log "Настраиваем PostgreSQL..."
systemctl start postgresql
systemctl enable postgresql

# Создаем базу данных
sudo -u postgres psql -c "CREATE DATABASE $DB_NAME;" || warn "База данных уже существует"
sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';" || warn "Пользователь уже существует"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"

log "Создаем директорию проекта..."
mkdir -p $PROJECT_DIR
chown -R www-data:www-data $PROJECT_DIR

log "Клонируем проект..."
cd /tmp
if [ -d "bonus-engine" ]; then
    rm -rf bonus-engine
fi
# Здесь нужно будет заменить на ваш репозиторий
# git clone https://github.com/yourusername/bonus-engine.git
# cp -r bonus-engine/* $PROJECT_DIR/

log "Настраиваем виртуальное окружение..."
cd $PROJECT_DIR
python3.11 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

log "Создаем .env файл..."
cat > .env << EOF
# Database Configuration
DB_USER=$DB_USER
DB_PASS=$DB_PASS
DB_HOST=localhost
DB_PORT=5432
DB_NAME=$DB_NAME

# Telegram Bot Configuration
BOT_TOKEN=your_bot_token_here
WEBHOOK_URL=https://$DOMAIN/webhook

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000

# Security
SECRET_KEY=$(openssl rand -base64 32)

# Environment
ENVIRONMENT=production
EOF

chown www-data:www-data .env
chmod 600 .env

log "Применяем миграции базы данных..."
cd backend
alembic upgrade head

log "Настраиваем systemd сервисы..."
cp ../bonus-engine-backend.service /etc/systemd/system/
cp ../bonus-engine-bot.service /etc/systemd/system/
systemctl daemon-reload

log "Настраиваем Nginx..."
cp ../nginx.conf /etc/nginx/sites-available/bonus-engine
sed -i "s/yourdomain.com/$DOMAIN/g" /etc/nginx/sites-available/bonus-engine
ln -sf /etc/nginx/sites-available/bonus-engine /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Проверяем конфигурацию Nginx
nginx -t

log "Настраиваем файрвол..."
ufw allow 22
ufw allow 80
ufw allow 443
ufw --force enable

log "Запускаем сервисы..."
systemctl enable bonus-engine-backend
systemctl enable bonus-engine-bot
systemctl start bonus-engine-backend
systemctl start bonus-engine-bot
systemctl reload nginx

log "Настраиваем SSL сертификат..."
certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN

log "Проверяем статус сервисов..."
systemctl status bonus-engine-backend --no-pager
systemctl status bonus-engine-bot --no-pager

log "✅ Деплой завершен!"
log "🌐 Сайт доступен по адресу: https://$DOMAIN"
log "📊 API документация: https://$DOMAIN/docs"
log "🤖 Не забудьте обновить BOT_TOKEN в .env файле!"
log "🔧 Для управления сервисами используйте:"
log "   sudo systemctl status bonus-engine-backend"
log "   sudo systemctl status bonus-engine-bot"
log "   sudo systemctl restart bonus-engine-backend"
log "   sudo systemctl restart bonus-engine-bot"

warn "⚠️  ВАЖНО:"
warn "1. Обновите BOT_TOKEN в файле $PROJECT_DIR/.env"
warn "2. Перезапустите сервисы: sudo systemctl restart bonus-engine-backend bonus-engine-bot"
warn "3. Проверьте логи: sudo journalctl -u bonus-engine-backend -f"
