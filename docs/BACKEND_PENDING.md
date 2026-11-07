# BACKEND_PENDING — مهام الباك إند المتبقية وعقود الـ API

> المرجع: الدراسة التحليلية. هذه الوثيقة موجهة لمطورة الباك إند.
> الواجهة مبنية على هذه العقود؛ الالتزام بها يعني ربطًا مباشرًا دون إعادة بناء الواجهة.
> إذا احتجتِ تغيير شكل استجابة، حدّثي هذا الملف أولًا ثم أخبرينا.
> مسارات ملفات Laravel في هذه الوثيقة نسبية إلى مجلد `backend/` (مثلًا `routes/api.php` تعني `backend/routes/api.php`).

## اتفاقيات عامة (تنطبق على كل الـ Endpoints)

- كل المسارات تحت `/api`، والطلبات بالهيدر `Accept: application/json`.
- المصادقة: `Authorization: Bearer <token>` (Sanctum).
- مجموعات الحماية الموجودة: `user.active` للمستخدم المسجل غير المحظور، و`admin.access` للأدمن.
- أخطاء التحقق: 422 بالشكل الافتراضي لـ Laravel: `{ "message": "...", "errors": { "field": ["..."] } }`.
- القوائم: Laravel Paginator (`paginate()->withQueryString()`)، ومعاملات `page` و `per_page` (أقصى 50).
- الكائن الواحد: `{ "data": {...} }`. الرسائل: `{ "message": "..." }`.
- الصور والملفات العامة: أعيدي رابطًا كاملًا عبر Accessor، مثل `cover_url` في `Book` و `image_url` في `User`.
- **تعلّم مقترح:** استخدمي في الميزات الجديدة `FormRequest` للتحقق، و`API Resource` لشكل الاستجابة، و`Policy` للصلاحيات. سنراجعها معًا.

## كيف تعرف الواجهة أن الـ Endpoint أصبح جاهزًا؟ (مهم)

لا يلزم تعديل أي شيء في الواجهة عند إنهاء ميزة.

1. الواجهة ترسل طلب فحص (GET بدون توكن) لكل ميزة. يُعاد الفحص كل دقيقة تقريبًا.
2. النتيجة تُقرأ هكذا:
   - إذا أعاد Laravel `404` برسالة `The route api/... could not be found.`، فالميزة **غير مبنية**. تعرض الواجهة "قيد التطوير".
   - أي استجابة أخرى (200، 401، 403، 405، 422، أو 404 لعنصر غير موجود) تعني أن **المسار موجود**. تُفعَّل الواجهة تلقائيًا.
3. لذلك: **أضيفي الـ Route فقط عندما يكون الـ Controller جاهزًا.** Route موجود بـ Controller ناقص سيُظهر أخطاء للمستخدمين.

| الميزة | مسار الفحص |
|---|---|
| المؤلفون | `GET /authors` |
| إدارة المؤلفين | `GET /admin/authors` (405 يكفي إن كان المسار POST فقط) |
| المتابعة | `GET /me/following` |
| القراءة | `GET /books/__probe__/progress` |
| المكتبة | `GET /me/library` |
| المفضلة | `GET /me/favorites` |
| المراجعات | `GET /books/__probe__/reviews` |
| إدارة المراجعات | `GET /admin/reviews` |
| المتجر | `GET /store/products` |
| إدارة المنتجات | `GET /admin/products` |
| السلة | `GET /cart` |
| الطلبات | `GET /orders` |
| إدارة الطلبات | `GET /admin/orders` |
| الإشعارات | `GET /notifications/unread-count` |
| التوصيات | `GET /me/recommendations` |
| الإحصائيات | `GET /admin/stats` |

### وضع المعاينة للمطورين
مع `SHOW_API_CONTRACTS=true` (مفعّل افتراضيًا في Docker للتطوير):
- كل صفحة لميزة غير مبنية تعرض **نفس الواجهة النهائية ببيانات مثال**، مع إطار متقطع وشارة "بيانات مثال وليست حقيقية"، وتكون غير قابلة للتفاعل.
- فوقها **العقد المطلوب**: الـ Endpoints والطرق والصلاحيات.
- بيانات المثال موجودة في `frontend/src/lib/pending/examples.ts` وهي مطابقة تمامًا لما يجب أن يعيده الـ API. افتحيه بجانب الـ Controller.
- قائمة العقود في `frontend/src/lib/pending/contracts.ts`.
- صفحات للتجربة: `/ar/authors`، `/ar/store`، `/ar/cart`، `/ar/checkout`، `/ar/account/library`، `/ar/account/favorites`، `/ar/account/orders`، `/ar/account/notifications`، `/ar/read/{slug}`، و`/ar/admin/authors|orders|products|reviews`.

### أشكال القوائم المقبولة
الواجهة تقبل أيًّا من هذه الأشكال:
- `Model::paginate()` مباشرة.
- `JsonResource::collection($paginator)`، أي `{ data, links, meta }`.
- `{ data: paginator }` كما في `/books`.

## ترتيب العمل المقترح

| # | الميزة | الأولوية في الدراسة | يعتمد على |
|---|---|---|---|
| 1 | نسيت كلمة المرور | أساسية | — |
| 2 | نموذج Editions والمؤلفون | أساسية | — |
| 3 | القراءة الإلكترونية (PDF) وتقدم القراءة | أساسية | 2 |
| 4 | المكتبة الشخصية والمفضلة | أساسية | — |
| 5 | التقييمات والمراجعات والبلاغات | أساسية | — |
| 6 | المتجر: المنتجات والمخزون | أساسية | 2 |
| 7 | السلة | أساسية | 6 |
| 8 | الطلبات والدفع عند الاستلام | أساسية | 7 |
| 9 | بيانات التواصل والعنوان في الملف الشخصي | أساسية | — |
| 10 | متابعة المؤلفين والإشعارات | أولية | 2، 8 |
| 11 | التوصيات والكتب المشابهة | أولية | 3، 4، 5 |
| 12 | إحصائيات لوحة التحكم | أساسية | 3، 8 |
| 13 | ترجمة رسائل الـ API (عربي/إنجليزي) | ثانوية | — |

---

## 1. نسيت كلمة المرور

| Method | URI | Auth | Body |
|---|---|---|---|
| POST | `/forgot-password` | عام + `throttle:6,1` | `{ email }` |
| POST | `/reset-password` | عام + `throttle:6,1` | `{ token, email, password, password_confirmation }` |

- استخدمي `Password::sendResetLink` و `Password::reset`. الجدول `password_reset_tokens` موجود.
- رابط البريد يشير إلى الواجهة: `{FRONTEND_URL}/{lang}/reset-password?token=...&email=...` عبر `ResetPassword::createUrlUsing` في `AppServiceProvider`.
- الاستجابة **نفسها** سواء وُجد البريد أم لا: `200 { message }`، حتى لا يُكشف إن كان البريد مسجلًا.
- في التطوير أضيفي Mailpit إلى Docker لرؤية الرسائل.

## 2. نموذج Editions والمؤلفون (قرار معتمد)

الكتاب هو العمل الأدبي، والنسخة (Edition) هي شكل محدد منه: إلكترونية أو ورقية. الجداول موجودة: `editions`، `formats`، `languages`، `publishers`، `people`، `book_credits`، `media_assets`، `edition_assets`. المطلوب:

1. Seeder للـ formats: `ebook` و`paperback`، وللـ languages: `ar` (rtl) و`en` (ltr).
2. علاقات الـ Models:
   - `Book`: `hasMany editions`، و`belongsToMany people` عبر `book_credits` مع `withPivot('role','display_order')`.
   - `Edition`: `belongsTo` كل من book و format و language و publisher.
3. نقل ملف الـ PDF من `books.file_path` إلى نسخة ebook (عبر `media_assets` + `edition_assets` بدور `asset_role = file`)، بـ Migration بيانات مع الحفاظ على الملفات الحالية.
4. إضافة حقول للكتاب في الاستجابة دون كسر الحقول الحالية:

```json
{
  "id": 1, "title": "...", "slug": "...", "description": "...", "cover_url": "...",
  "has_ebook": true,
  "authors":  [{ "id": 3, "name": "...", "slug": "...", "role": "author" }],
  "editions": [
    { "id": 10, "format": "ebook", "language": { "code": "ar", "name": "العربية" },
      "publisher": { "id": 2, "name": "..." }, "publication_date": "2024-05-01", "page_count": 320 },
    { "id": 11, "format": "paperback", "language": {...}, "page_count": 320,
      "product": { "price": "12.00", "currency": "USD", "stock": 7, "in_stock": true } }
  ],
  "rating": { "average": 4.3, "count": 18 },
  "categories": [ ... ]
}
```

5. **فلاتر** `GET /books` الإضافية: `author` (slug)، `language` (code)، `format` (ebook|paperback)، `min_price`، `max_price`، `min_rating`، `published_from`، `published_to`. والترتيب الإضافي في `sort`: `popular` (الأكثر قراءة)، `top_rated`، `best_selling`.
6. **البحث** يشمل اسم المؤلف واسم التصنيف (`whereHas`).

### المؤلفون

| Method | URI | Auth | ملاحظات |
|---|---|---|---|
| GET | `/authors` | عام | `search`، Pagination |
| GET | `/authors/{slug}` | عام | `{ data: { id, name, slug, biography, image_url, categories: [...], books_count } }` |
| GET | `/books?author={slug}` | عام | كتب المؤلف |
| POST | `/admin/authors` | أدمن | multipart: `name`, `biography?`, `image?` |
| POST | `/admin/authors/{id}` | أدمن | تعديل (POST من أجل multipart) |
| DELETE | `/admin/authors/{id}` | أدمن | 422 إذا كان مرتبطًا بكتب |

إضافة وتعديل الكتاب يقبلان أيضًا: `authors[]` (ids)، `language_id`، `publisher_id?`، `publication_date?`، `page_count?`.

## 3. القراءة الإلكترونية (PDF) وتقدم القراءة

| Method | URI | Auth | الوصف |
|---|---|---|---|
| GET | `/books/{slug}/read` | user.active | يبث ملف PDF من القرص الخاص: `Storage::disk('local')->response(...)` مع `Content-Type: application/pdf` |
| GET | `/books/{slug}/progress` | user.active | `{ data: { page: 37, total_pages: 320, percent: 11.6, updated_at } }` أو `{ data: null }` |
| PUT | `/books/{slug}/progress` | user.active | `{ page, total_pages }`. التحقق: `page` بين 1 و`total_pages` |

- جدول جديد `reading_progress(user_id, book_id, page, total_pages, updated_at)` بمفتاح فريد على (user_id, book_id).
- حفظ التقدم يجعل حالة الكتاب في المكتبة "أقرأه حاليًا" تلقائيًا، وعند `page == total_pages` تصبح "أكملته".
- **الأمان:** لا يُرسل مسار الملف للواجهة أبدًا. الـ Endpoint هو البوابة الوحيدة للملف.
- الواجهة ستعرض الملف داخل قارئ PDF (pdf.js) عبر خادم Next، الذي يمرّر التوكن.

## 4. المكتبة الشخصية والمفضلة

| Method | URI | Auth | Body / Query | Response |
|---|---|---|---|---|
| GET | `/me/library` | user.active | `status?` = want_to_read\|reading\|finished، page | Paginator لعناصر `{ book: Book, status, added_at, progress? }` |
| PUT | `/me/library/{book_id}` | user.active | `{ status }` | 200 `{ data: item }` (يضيف أو يحدّث) |
| DELETE | `/me/library/{book_id}` | user.active | — | 200 |
| GET | `/me/favorites` | user.active | page | Paginator لـ Book |
| PUT | `/me/favorites/{book_id}` | user.active | — | 200 (Idempotent) |
| DELETE | `/me/favorites/{book_id}` | user.active | — | 200 |

- جدولان: `library_items(user_id, book_id, status, timestamps)` بفريد (user, book)، و`favorites(user_id, book_id, created_at)`.
- **مهم للواجهة:** في `GET /books/{slug}` أضيفي، إذا أُرسل توكن صالح، الحقل `viewer: { library_status: "reading"|null, is_favorite: bool, my_review_id: int|null }`. هكذا تعرض الواجهة الزر المناسب، مثل "إزالة من المفضلة" بدل "إضافة". الزائر يأخذ `viewer: null`.
  - تلميح: المسار العام لا يمر بـ `auth:sanctum`، فاستخدمي `auth('sanctum')->user()` داخل الـ Controller.

## 5. التقييمات والمراجعات والبلاغات

| Method | URI | Auth | Body / Query |
|---|---|---|---|
| GET | `/books/{slug}/reviews` | عام | `sort` = latest\|top، page → Paginator لـ `{ id, rating, body, user: {id,name,image_url}, created_at, updated_at }` |
| POST | `/books/{slug}/reviews` | user.active | `{ rating: 1..5, body?: string max 3000 }`. مراجعة واحدة لكل مستخدم لكل كتاب (وإلا 422) |
| PATCH | `/reviews/{id}` | user.active (المالك فقط، Policy) | `{ rating?, body? }` |
| DELETE | `/reviews/{id}` | المالك أو الأدمن | — |
| POST | `/reviews/{id}/report` | user.active | `{ reason: spam\|offensive\|spoiler\|other, note? }`. بلاغ واحد لكل مستخدم |
| GET | `/admin/reviews` | أدمن | `reported=1`، `search`، page |
| GET | `/admin/reports` | أدمن | `status` = open\|resolved |
| PATCH | `/admin/reports/{id}` | أدمن | `{ status: "resolved", action: "dismiss"\|"delete_review" }` |

- `rating` في استجابة الكتاب: `{ average, count }`. يمكن حسابه بـ `withAvg` و`withCount`، أو تخزينه في أعمدة على `books` تُحدَّث عند كل تقييم.

## 6. المتجر: المنتجات والمخزون

المنتج = نسخة ورقية قابلة للبيع.

- جدول `products(edition_id unique, price decimal(10,2), currency char(3), stock int, shipping_info text?, status active|hidden, timestamps)`.

| Method | URI | Auth | الوصف |
|---|---|---|---|
| GET | `/store/products` | عام | الكتب الورقية المتاحة: نفس فلاتر الكتب + `in_stock=1`. العنصر: `{ id, price, currency, stock, in_stock, shipping_info, book: {id,title,slug,cover_url,authors} }` |
| GET | `/admin/products` | أدمن | كل المنتجات + `low_stock=1` |
| POST | `/admin/products` | أدمن | `{ edition_id, price, currency, stock, shipping_info?, status }` |
| PATCH | `/admin/products/{id}` | أدمن | تعديل السعر والمخزون والحالة |

## 7. السلة

| Method | URI | Auth | Body |
|---|---|---|---|
| GET | `/cart` | user.active | — |
| POST | `/cart/items` | user.active | `{ product_id, quantity: 1..10 }`. إذا كان موجودًا تُجمع الكمية |
| PATCH | `/cart/items/{id}` | user.active | `{ quantity }` |
| DELETE | `/cart/items/{id}` | user.active | — |

استجابة موحدة لكل العمليات:
```json
{ "data": {
  "items": [{ "id": 1, "quantity": 2, "unit_price": "12.00", "line_total": "24.00",
              "available": true, "product": { "id": 4, "stock": 7, "book": {...} } }],
  "subtotal": "24.00", "shipping": "3.00", "total": "27.00", "currency": "USD", "count": 2 } }
```
- كل الحسابات في الباك إند فقط. الواجهة لا تحسب الأسعار.
- قاعدة الشحن: قرار يحتاج تحديدًا (سعر ثابت؟ حسب المدينة؟). ضعيها مؤقتًا في `config/store.php`.

## 8. الطلبات والدفع عند الاستلام

| Method | URI | Auth | Body / Query |
|---|---|---|---|
| POST | `/orders` | user.active | `{ name, phone, city, address, notes? }`. ينشئ الطلب من السلة ويفرّغها |
| GET | `/orders` | user.active | page → طلباتي |
| GET | `/orders/{id}` | المالك | تفاصيل الطلب |
| POST | `/orders/{id}/cancel` | المالك | فقط إذا كانت الحالة `pending` |
| GET | `/admin/orders` | أدمن | `status`، `search` (رقم الطلب أو الاسم أو الهاتف)، page |
| GET | `/admin/orders/{id}` | أدمن | — |
| PATCH | `/admin/orders/{id}/status` | أدمن | `{ status }` مع انتقالات مسموحة فقط |

- **الحالات** (من الدراسة): `pending` (قيد المعالجة) ← `confirmed` (تم التأكيد) ← `preparing` (قيد التجهيز) ← `shipped` (تم الشحن) ← `delivered` (تم التسليم)، ويمكن الانتقال إلى `cancelled` قبل `shipped` فقط.
- **Transaction إجباري** عند إنشاء الطلب: تحقّقي من المخزون وأنقصيه داخل `DB::transaction` مع `lockForUpdate`، ثم أنشئي `orders` و`order_items` بنسخ السعر وقت الشراء، ثم فرّغي السلة.
- `payment_method = "cod"` فقط حاليًا. لا تُخزن أي بيانات بطاقات (متطلب أمني في الدراسة).
- جدول `order_status_history(order_id, status, changed_by, created_at)` لعرض التتبع.

```json
{ "data": { "id": 15, "number": "LL-000015", "status": "shipped", "payment_method": "cod",
  "items": [{ "title": "...", "quantity": 1, "unit_price": "12.00", "line_total": "12.00", "book_slug": "..." }],
  "subtotal": "12.00", "shipping": "3.00", "total": "15.00", "currency": "USD",
  "shipping_address": { "name": "...", "phone": "...", "city": "...", "address": "..." },
  "history": [{ "status": "pending", "at": "..." }, { "status": "shipped", "at": "..." }],
  "created_at": "..." } }
```

## 9. بيانات التواصل والعنوان

- إضافة إلى `POST /profile/update`: `display_name?`، `bio?` (جدول `user_profiles` الموجود)، و`phone?`، `city?`، `address?` (Migration جديدة).
- `GET /user` يعيد `profile` ضمن الاستجابة.
- الواجهة ستملأ نموذج الطلب تلقائيًا من هذه البيانات.

## 10. متابعة المؤلفين والإشعارات

| Method | URI | Auth |
|---|---|---|
| PUT / DELETE | `/authors/{id}/follow` | user.active |
| GET | `/me/following` | user.active |
| GET | `/notifications` | user.active، `unread=1`، page |
| GET | `/notifications/unread-count` | user.active → `{ count }` |
| POST | `/notifications/{id}/read` | user.active |
| POST | `/notifications/read-all` | user.active |

- استخدمي جدول `notifications` الافتراضي في Laravel (`php artisan make:notifications-table`) مع قناة `database`.
- أنواع الإشعارات: `new_book`، `author_new_book`، `book_updated`، `order_status_changed`، `back_in_stock`، `promotion`.
- `data` لكل إشعار: `{ type, title, body, url }`، و`url` مسار داخل الواجهة مثل `/books/slug`.
- الإرسال لعدد كبير من المتابعين يكون عبر Queue (Job). عندها يُضاف Queue Worker إلى Docker.

## 11. التوصيات والكتب المشابهة

| Method | URI | Auth | Response |
|---|---|---|---|
| GET | `/books/{slug}/similar` | عام | حتى 10 كتب بنفس التصنيفات أو المؤلف، مستبعدًا الكتاب نفسه |
| GET | `/me/recommendations` | user.active | `{ data: { for_reading: Book[], for_buying: Product[] } }` |

- **نسخة أولى بسيطة:** التصنيفات والمؤلفون الأكثر تكرارًا في مكتبة المستخدم وتقييماته العالية (4 و5)، مستبعدًا ما قرأه.
- إن لم تتوفر بيانات للمستخدم: الأعلى تقييمًا والأحدث.

## 12. إحصائيات لوحة التحكم

`GET /admin/stats` (أدمن):
```json
{ "data": {
  "books": 120, "users": 340, "users_banned": 3,
  "orders": { "total": 58, "pending": 4, "revenue": "1240.00", "currency": "USD" },
  "reading": { "active_readers_30d": 87 },
  "reviews": { "total": 210, "reported_open": 2 },
  "top_books": [{ "id": 1, "title": "...", "reads": 40 }],
  "low_stock": [{ "product_id": 4, "title": "...", "stock": 1 }]
} }
```
لوحة التحكم تعرض حاليًا أعداد الكتب والتصنيفات والمستخدمين من الـ Endpoints الموجودة، وتنتظر هذا الـ Endpoint لعرض البقية.

## 13. ترجمة رسائل الـ API

- الواجهة ترسل `Accept-Language: ar|en`. Middleware يضبط `app()->setLocale()`.
- `php artisan lang:publish`، ثم أضيفي `lang/ar/validation.php`. حاليًا رسائل التحقق إنجليزية، ورسائل الـ Controllers عربية فقط.

---

## سجل التحديث

| التاريخ | التغيير |
|---|---|
| 2026-11-07 | النسخة الأولى |
| 2026-11-07 | أُضيفت آلية الفحص التلقائي ووضع المعاينة؛ الواجهات لكل الأقسام §2 إلى §12 مبنية وتنتظر الـ Endpoints |
