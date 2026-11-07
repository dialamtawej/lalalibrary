# بيئة Docker — مكتبة لالا

بيئة التطوير تعمل بالكامل داخل Docker. على جهازك تحتاجين فقط **Docker Desktop** (مع Docker Compose v2). لا حاجة لتثبيت PHP أو Composer أو MySQL.

## الخدمات

| الخدمة | الحاوية | الدور | العنوان |
|---|---|---|---|
| `app` | `lalalibrary_app_container` | Laravel على PHP-FPM 8.2 | داخلي: `app:9000` |
| `nginx` | `lalalibrary_nginx_container` | خادم HTTP يمرر الطلبات إلى `app` | من المتصفح: `http://localhost:8000` |
| `db` | `lalalibrary_db_container` | MySQL 8.0 | داخلي: `db:3306` · من جهازك: `127.0.0.1:3306` |
| `frontend` | `lalalibrary_frontend_container` | Next.js (وضع التطوير) | من المتصفح: `http://localhost:3000` |

```
المتصفح ──► frontend :3000 (Next.js) ──► http://nginx/api ──► app (php-fpm) ──► db
Postman ──► nginx :8000 ──────────────────────────────────┘
المتصفح ──► localhost:8000/storage/... (الأغلفة والصور)
```

- **داخل Docker** تتصل الخدمات ببعضها بأسماء الخدمات (`db`، `app`)، لذلك `DB_HOST=db` وليس `localhost`.
- **من جهازك** (Postman، المتصفح، DBeaver) تستخدمين `localhost:8000` للـ API و `127.0.0.1:3306` لقاعدة البيانات.
- بيانات MySQL محفوظة في Volume مسمّى `db_data`، فلا تضيع عند إيقاف الحاويات أو إعادة بنائها.
- **عنوانان مختلفان لـ Laravel:** خادم Next داخل Docker يصل إليه عبر `http://nginx/api`، وهذا مضبوط تلقائيًا في `docker-compose.yml`. أما المتصفح فيرى الصور على `http://localhost:8000`، أي قيمة `APP_URL`.
- `node_modules` و `.next` الخاصة بالواجهة في Volumes منفصلة، حتى لا تتعارض مع ملفات Windows وتكون أسرع.

## ملفا البيئة

| الملف | لمن | يحتوي |
|---|---|---|
| `.env` (الجذر) | `docker-compose.yml` | كلمات مرور MySQL، المنافذ، `DOCKER_UID`، `SHOW_API_CONTRACTS` |
| `backend/.env` | Laravel | `APP_KEY`، `APP_URL`، بيانات الـ Seeders، البريد… |

داخل Docker، `DB_DATABASE` و `DB_USERNAME` و `DB_PASSWORD` تُمرر من `.env` الجذر إلى حاوية `app` وتتقدم على قيم `backend/.env`، فتُكتب كلمة المرور في مكان واحد فقط.

## التشغيل لأول مرة

```bash
# 1) إنشاء ملفي البيئة
cp .env.example .env
cp backend/.env.example backend/.env

# 2) املئي على الأقل:
#    في .env:          DB_PASSWORD و DB_ROOT_PASSWORD
#    في backend/.env:  SEED_ADMIN_EMAIL و SEED_ADMIN_PASSWORD (حساب الأدمن الأول)

# 3) البناء والتشغيل
docker compose up -d --build

# 4) إنشاء الجداول والبيانات الأولية
docker compose exec app php artisan migrate --seed
```

في أول تشغيل، حاوية `app` تثبت حزم Composer تلقائيًا وتولد `APP_KEY` إذا كان فارغًا (قد يستغرق ذلك بضع دقائق). تابعي التقدم بـ:
```bash
docker compose logs -f app
```

اختبار سريع:
- `http://localhost:8000/up`: يجب أن تظهر صفحة "Application up" من Laravel.
- `http://localhost:3000`: الواجهة. أول تشغيل يثبت حزم npm، وقد يستغرق دقيقتين. تابعي التقدم بـ `docker compose logs -f frontend`.

## الأوامر اليومية

| المهمة | الأمر |
|---|---|
| تشغيل | `docker compose up -d` |
| إيقاف (البيانات تبقى) | `docker compose down` |
| حالة الخدمات | `docker compose ps` |
| السجلات | `docker compose logs -f` أو `docker compose logs -f app` |
| إعادة البناء بعد تعديل Dockerfile | `docker compose up -d --build` |
| أمر Artisan | `docker compose exec app php artisan <command>` |
| Migrations | `docker compose exec app php artisan migrate` |
| حالة Migrations | `docker compose exec app php artisan migrate:status` |
| Seeders | `docker compose exec app php artisan db:seed` |
| قائمة المسارات | `docker compose exec app php artisan route:list --path=api` |
| تثبيت حزمة Composer | `docker compose exec app composer require vendor/package` |
| Tinker | `docker compose exec app php artisan tinker` |
| Shell داخل الحاوية | `docker compose exec app bash` |
| سطر أوامر MySQL | `docker compose exec db mysql -u lalalibrary -p lalalibrary_db` |
| مسح الكاش | `docker compose exec app php artisan optimize:clear` |
| سجلات الواجهة | `docker compose logs -f frontend` |
| تثبيت حزمة npm | `docker compose exec frontend npm install <package>` |
| فحص الواجهة | `docker compose exec frontend npm run lint` و `npx tsc --noEmit` |

## أوامر تحذف البيانات — استخدميها بوعي

| الأمر | ماذا يحذف |
|---|---|
| `php artisan migrate:fresh --seed` | يحذف **كل الجداول** ويعيد إنشاءها |
| `docker compose down -v` | يحذف **Volume قاعدة البيانات** بالكامل |

## ملاحظة عن الانتقال من الإعداد السابق

- الإعداد السابق كان يحفظ بيانات MySQL في Volume مجهول، والإعداد الجديد يستخدم `db_data`. لذلك ستبدأ القاعدة فارغة؛ شغلي `migrate --seed` مرة واحدة.
- كلمات المرور القديمة كانت مكتوبة في `docker-compose.yml` المرفوع على GitHub (مستودع عام)، فاختاري كلمات مرور جديدة في `.env`.
- لإزالة الحاوية القديمة إن بقيت: `docker compose down --remove-orphans`.

## الملفات

```
backend/                   كود Laravel، ويُربط داخل app و nginx على /var/www
Dockerfile                 صورة app (PHP-FPM + extensions + Composer)، تعمل بمستخدم غير root، تنسخ backend/
docker-compose.yml         الخدمات والشبكة والـ Volumes
docker/php/php.ini         حجم الرفع 25MB (ملف الكتاب حتى 20MB)
docker/php/entrypoint.sh   تثبيت Composer وتوليد APP_KEY وتجهيز storage عند الإقلاع
docker/nginx/default.conf  إعداد Nginx لـ Laravel + خدمة /storage
.dockerignore              ما لا يُنسخ إلى الصورة (.env, vendor, .git...)
```

## الملفات المرفوعة

- **الأغلفة والصور الشخصية:** القرص `public` في `backend/storage/app/public`، وتُخدم عبر `http://localhost:8000/storage/...` من Nginx مباشرة. لا حاجة لـ `php artisan storage:link`، لأن الروابط الرمزية لا تعمل بشكل موثوق داخل مجلدات Windows المشتركة.
- **ملفات الكتب (PDF):** القرص الخاص `local` في `backend/storage/app/private`، وغير متاحة من الرابط مباشرة. ستُقدَّم عبر Endpoint محمي عند تطوير ميزة القراءة.

## حل المشاكل الشائعة

| المشكلة | الحل |
|---|---|
| `Set DB_PASSWORD in .env` عند التشغيل | املئي `DB_PASSWORD` و `DB_ROOT_PASSWORD` في `.env` بجذر المستودع |
| `app` يتوقف فورًا | `docker compose logs app`. غالبًا `backend/.env` غير موجود، أو فشل `composer install` بسبب الإنترنت |
| `SQLSTATE[HY000] [2002] Connection refused` | تأكدي أن `db` تعمل، وأن `db` حالتها `healthy` في `docker compose ps` |
| `Access denied for user` بعد تغيير كلمة المرور في `.env` الجذر | MySQL يقرأ كلمات المرور عند **أول** إنشاء للـ Volume فقط. إما أن تعيدي الكلمة القديمة، أو تحذفي الـ Volume (`docker compose down -v`، وهذا يحذف البيانات) |
| المنفذ 8000 أو 3306 مستخدم | غيري `APP_PORT` أو `FORWARD_DB_PORT` في `.env` |
| `413 Request Entity Too Large` عند رفع كتاب | الحد 30MB في Nginx و 25MB في PHP؛ تأكدي من حجم الملف |
| بطء شديد على Windows | ضعي المشروع داخل نظام ملفات WSL2 (مثل `\\wsl$\Ubuntu\home\...`) بدل `C:\Users\...` |
| أخطاء صلاحيات الكتابة في `backend/storage` على Linux | اضبطي `DOCKER_UID` و `DOCKER_GID` في `.env` على ناتج `id -u` و `id -g`، ثم `docker compose up -d --build` |
| تعديلات الواجهة لا تظهر فورًا (Hot Reload بطيء على Windows) | هذه مشكلة معروفة في مشاركة الملفات بين Windows و Docker. شغّلي الواجهة خارج Docker: `cd frontend && npm install && npm run dev`، مع `LARAVEL_API_URL=http://localhost:8000/api` في `frontend/.env.local`. أو انقلي المشروع إلى WSL2 |
| الواجهة تعرض "تعذر الاتصال بالخادم" | تأكدي أن `nginx` و `app` يعملان (`docker compose ps`)، وأن `LARAVEL_API_URL` صحيح |
| صور الأغلفة لا تظهر | تأكدي أن `APP_URL=http://localhost:8000` في `backend/.env` |
| الطلب يرجع HTML بدل JSON | كل مسارات `/api/*` ترجع JSON الآن. تأكدي أن الرابط يبدأ بـ `/api/` |

## الإنتاج

هذا الإعداد للتطوير فقط: الكود مربوط من جهازك، و `APP_DEBUG=true`، ومنفذ القاعدة مفتوح محليًا. إعداد الإنتاج (صورة بدون Bind Mount، `composer install --no-dev`، `config:cache`، HTTPS) سيُضاف في مرحلة النشر.
