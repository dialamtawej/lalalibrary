# مكتبة لالا — Lala Library

منصة للكتب والروايات: استكشاف الكتب والبحث عنها، قراءة النسخ الإلكترونية، مكتبة شخصية، تقييمات ومراجعات، ومتجر للكتب الورقية مع لوحة تحكم إدارية.

| الجزء | التقنية | المجلد |
|---|---|---|
| Backend API | Laravel 12 · PHP 8.2 · Sanctum (Bearer Tokens) | جذر المستودع |
| Database | MySQL 8.0 | خدمة `db` في Docker |
| Frontend | Next.js 16 · React 19 · TypeScript · Tailwind 4 | `frontend/` |

## التشغيل السريع

المتطلب الوحيد: Docker Desktop.

```bash
cp .env.example .env          # ثم املئي DB_PASSWORD و DB_ROOT_PASSWORD وبيانات الأدمن
docker compose up -d --build
docker compose exec app php artisan migrate --seed
```

- الواجهة: `http://localhost:3000`
- الـ API: `http://localhost:8000/api`

التفاصيل الكاملة والأوامر وحل المشاكل في [DOCKER_SETUP.md](DOCKER_SETUP.md).

## الحسابات التجريبية (بيئة local فقط)

| الحساب | البريد | كلمة المرور |
|---|---|---|
| Admin | `SEED_ADMIN_EMAIL` من `.env` | `SEED_ADMIN_PASSWORD` من `.env` (أو تُطبع عند التشغيل إن تُركت فارغة) |
| مستخدمون | `sdra@example.com`, `dalaa@example.com`, `test@example.com` | `SEED_USER_PASSWORD` (الافتراضي `password`) |

## المصادقة

```http
POST /api/login
Accept: application/json
Content-Type: application/json

{ "email": "...", "password": "..." }
```
الاستجابة تحتوي `access_token`. يُرسل في الطلبات المحمية بالهيدر:
```
Authorization: Bearer <access_token>
```

## الوثائق

- [DOCKER_SETUP.md](DOCKER_SETUP.md): بيئة التطوير.
- [docs/PROJECT_STATUS.md](docs/PROJECT_STATUS.md): جدول حالة كل Feature في الباك إند والواجهة.
- [docs/BACKEND_PENDING.md](docs/BACKEND_PENDING.md): مهام الباك إند المتبقية وعقود الـ API المطلوبة.
- [docs/BACKEND_CHANGES.md](docs/BACKEND_CHANGES.md): سجل مراجعات وتعديلات الباك إند مع شرح كل تعديل.
- [frontend/README.md](frontend/README.md): بنية الواجهة وطريقة إضافة Feature.
