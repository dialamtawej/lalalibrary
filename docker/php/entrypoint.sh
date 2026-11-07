#!/bin/sh
# يُنفذ عند تشغيل حاوية app قبل php-fpm
set -e

cd /var/www

if [ ! -f .env ]; then
    echo "[lalalibrary] ERROR: ملف .env غير موجود. انسخه أولًا: cp .env.example .env" >&2
    exit 1
fi

# تثبيت حزم Composer في أول تشغيل (vendor غير مرفوع إلى Git)
if [ ! -f vendor/autoload.php ]; then
    echo "[lalalibrary] Installing Composer dependencies..."
    composer install --no-interaction --prefer-dist
fi

# توليد APP_KEY إذا كان فارغًا
if ! grep -q '^APP_KEY=base64:' .env; then
    echo "[lalalibrary] Generating APP_KEY..."
    php artisan key:generate --force
fi

# مجلدات يحتاجها Laravel للكتابة
mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views \
         storage/logs storage/app/public storage/app/private bootstrap/cache

exec "$@"
