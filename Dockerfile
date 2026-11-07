# ========================================================
# ملاحظة مراجعة - Dockerfile لخدمة app (Laravel / PHP-FPM)
# التغييرات عن النسخة السابقة:
#  - إضافة libzip/libjpeg/libfreetype لتفعيل zip و gd بدعم JPEG.
#  - إعدادات PHP خاصة (حجم الرفع 25MB لأن ملف الكتاب يصل إلى 20MB،
#    بينما الافتراضي في PHP هو 2MB فقط، فكان رفع الكتب سيفشل).
#  - التشغيل بمستخدم غير root (laravel) بدل root.
#  - Entrypoint يثبت حزم Composer تلقائيًا ويجهز مجلدات storage.
#  - سياق البناء هو جذر المستودع (لنصل إلى docker/)، وكود Laravel في backend/.
# ========================================================
FROM php:8.2-fpm

ARG UID=1000
ARG GID=1000

RUN apt-get update && apt-get install -y --no-install-recommends \
        git \
        curl \
        zip \
        unzip \
        libpng-dev \
        libjpeg62-turbo-dev \
        libfreetype6-dev \
        libonig-dev \
        libxml2-dev \
        libzip-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

COPY docker/php/php.ini /usr/local/etc/php/conf.d/zz-lalalibrary.ini
COPY docker/php/entrypoint.sh /usr/local/bin/lalalibrary-entrypoint
RUN chmod +x /usr/local/bin/lalalibrary-entrypoint

RUN groupadd -g ${GID} laravel && useradd -u ${UID} -g laravel -m -s /bin/bash laravel

WORKDIR /var/www

COPY --chown=laravel:laravel backend/ .

USER laravel

EXPOSE 9000

ENTRYPOINT ["lalalibrary-entrypoint"]
CMD ["php-fpm"]
