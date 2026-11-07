# سجل مراجعة الباك إند — الدفعة 1: إصلاح الأخطاء

> الفرع: `fix/discovery-review` · التاريخ: 2026-11-07
> الهدف: إصلاح الأخطاء التي ظهرت في مراجعة الكود دون إضافة ميزات جديدة.
> كل تعديل على كود موجود محفوظ في الملف نفسه بتنسيق
> `PREVIOUS IMPLEMENTATION - KEPT FOR REVIEW` ثم `UPDATED IMPLEMENTATION`.
> لعرض كل الفروقات: `git diff main..fix/discovery-review`
> مسارات ملفات Laravel في هذه الوثيقة نسبية إلى مجلد `backend/` (مثلًا `routes/api.php` تعني `backend/routes/api.php`).

## كيف تقرئين هذا الملف
كل بند فيه: **المشكلة**، و**لماذا هي مشكلة**، و**الإصلاح**، و**المفهوم** الذي يستحق التعلم منه.

---

## 1. خطأ 500 عند تعديل بريد مستخدم
**الملف:** `UserController@updateUser`

- **المشكلة:** `unique:user,email` تشير إلى جدول اسمه `user`، والجدول الحقيقي اسمه `users`.
- **لماذا هي مشكلة:** Laravel ينفذ استعلامًا على جدول غير موجود، فتحدث `QueryException` وينتهي الطلب بخطأ 500.
- **الإصلاح:** `unique:users,email,{id}`.
- **المفهوم:** قاعدة `unique:table,column,ignoreId` تتجاهل السجل الحالي حتى لا يفشل التحقق عندما يُرسل المستخدم بريده نفسه.

## 2. تحديث الأدوار قد يحذف كل أدوار المستخدم
**الملف:** `UserController@updateRoles`

- **المشكلة:** الـ Validation يتحقق من `role`، والكود يستخدم `roles`.
- **لماذا هي مشكلة:**
  - إرسال `roles` يفشل دائمًا برسالة "role مطلوب".
  - إرسال `role` يجعل `$request->roles` تساوي `null`، و `sync(null)` تعادل `sync([])`، أي **حذف كل الأدوار**. لو كان المستخدم هو الأدمن الوحيد، يفقد النظام الأدمن.
- **الإصلاح:** التحقق من `roles` نفسها (`required|array|min:1`)، ومنع الأدمن من إزالة دور الأدمن عن نفسه، والحفاظ على `assigned_at` للأدوار الموجودة.
- **المفهوم:** استخدمي القيم الراجعة من `$request->validate()` بدل `$request->field`، فتضمنين أنك تعملين فقط بما تم التحقق منه. وتذكري أن `sync()` تحذف كل ما ليس في القائمة.

## 3. فحص الحظر قبل التحقق من كلمة المرور
**الملف:** `AuthController@login`

- **المشكلة:** الكود يبحث عن المستخدم بالبريد ويرد "حسابك محظور" قبل أن يتحقق من كلمة المرور.
- **لماذا هي مشكلة:** أي شخص يعرف أن الحساب محظور بمجرد إدخال البريد. هذا تسريب معلومات (User Enumeration).
- **الإصلاح:** `Auth::validate()` أولًا، ثم فحص الحظر، ثم إنشاء التوكن. يُرجع المستخدم مع `roles`.
- **المفهوم:** `Auth::attempt()` تسجل دخولًا وتنشئ جلسة، أما `Auth::validate()` فتتحقق فقط. في API يعتمد على Tokens لا نحتاج الجلسة.

## 4. المستخدم الجديد بلا دور
**الملف:** `AuthController@register`

- **المشكلة:** التسجيل لا يضيف سجلًا في `user_roles`.
- **الإصلاح:** إسناد الدور `user` (بالبحث عنه بالـ `code`). أُزيل `Auth::login()` لأنه ينشئ جلسة web غير مستخدمة. أُضيف `ban_info` الافتراضي.
- **ملاحظة إضافية:** `max:255` على `name` بينما العمود `string('name', 100)`. اسم طويل يجتاز الـ Validation ثم يفشل في MySQL. أصبح `max:100` هنا وفي `updateProfile` و `updateUser`.
- **المفهوم:** يجب أن تطابق قواعد الـ Validation قيود قاعدة البيانات.

## 5. حماية تسجيل الدخول من التخمين
**الملف:** `routes/api.php`

- **الإصلاح:** `throttle:6,1` على `/login` و `/register`، أي 6 محاولات في الدقيقة لكل IP. بعدها يرجع `429 Too Many Requests`.
- **المفهوم:** Rate Limiting.

## 6. `/api/user` لا يرجع الأدوار
- **المشكلة:** الواجهة لا تستطيع معرفة إن كان المستخدم أدمن لتعرض له لوحة التحكم.
- **الإصلاح:** `$request->user()->load('roles')`.

## 7. أخطاء API ترجع HTML أو 500
**الملف:** `bootstrap/app.php`

- **المشكلة:** طلب لمسار محمي بدون توكن وبدون الهيدر `Accept: application/json` يجعل Laravel يحاول التحويل إلى `route('login')`، وهو غير موجود، فيحدث خطأ 500.
- **الإصلاح:** `shouldRenderJsonWhen`. كل أخطاء `api/*` ترجع JSON (401، 403، 404، 422، 500).

## 8. الأدمن يستطيع حظر نفسه
**الملف:** `UserController@banUser`

- **الإصلاح:** نفس الحماية الموجودة في `deleteUser`.

## 9. رسالة الحذف وتوكنات المستخدم المحذوف
**الملف:** `UserController@deleteUser`

- **المشكلة:** الموديل يستخدم `SoftDeletes` (حذف ناعم)، والرسالة تقول "نهائيًا". كما بقيت توكنات المستخدم المحذوف صالحة.
- **الإصلاح:** تعديل الرسالة، وحذف توكنات المستخدم.
- **للتفكير:** بعد الحذف الناعم يبقى البريد محجوزًا بسبب `unique`. هل نسمح بإعادة التسجيل بنفس البريد؟ (قرار لاحق.)

## 10. توكن حقيقي داخل الكود
**الملف:** `BookController.php` (آخر سطر)

- **المشكلة:** توكن Sanctum ملصق كتعليق، والمستودع عام على GitHub.
- **الإصلاح:** حذف السطر. **مطلوب منك:** حذف هذا التوكن من جدول `personal_access_tokens` في أي قاعدة بيانات استُخدم فيها.
- **المفهوم:** لا توضع أسرار في الكود أبدًا. Git يحتفظ بالتاريخ، فما رُفع مرة يبقى ظاهرًا في الـ commits القديمة. الحل الصحيح هو **إبطال** السر، وليس حذفه فقط.

## 11. ملفات الكتب كانت علنية
**الملف:** `BookController@store/updateBook`

- **المشكلة:** ملف الـ PDF يُحفظ على القرص `public`، فأي شخص يعرف الرابط ينزّله بدون حساب.
- **الإصلاح:** الحفظ على القرص الخاص `local` (`storage/app/private`). الأغلفة تبقى على `public` لأنها للعرض.
- **المفهوم:** القرص `public` لما يجوز أن يراه الجميع. المحتوى المحمي يُقدَّم عبر Endpoint يتحقق من الصلاحية أولًا. **هذه مهمتك القادمة** ضمن ميزة القراءة.

## 12. ملفات قديمة تتراكم + الـ slug يتغير
**الملف:** `BookController@updateBook`

- **المشكلة:** عند رفع غلاف أو ملف جديد يبقى القديم في التخزين للأبد. والـ `slug` يُعاد إنشاؤه عند كل تعديل للعنوان، فتنكسر روابط صفحة الكتاب.
- **الإصلاح:** حذف الملف القديم **بعد** نجاح `save()`، والـ slug يُنشأ مرة واحدة عند الإضافة.
- **المفهوم:** الـ slug معرّف ثابت للرابط مثل الـ id. وترتيب العمليات مهم: لا نحذف القديم قبل التأكد من حفظ الجديد.

## 13. إضافة كتاب بدون Transaction
**الملف:** `BookController@store`

- **الإصلاح:** `Book::create` و `categories()->attach` داخل `DB::transaction`. إن فشل أحدهما يُلغى الاثنان، وتُحذف الملفات المرفوعة.
- **المفهوم:** Atomicity: العمليات المترابطة تنجح معًا أو تفشل معًا.

## 14. أسماء الكلاسات لا تطابق أسماء الملفات
**الملفات:** 9 Controllers فارغة (مثال: `EditionController.php` كان فيه `class Edition`)

- **المشكلة:** معيار PSR-4 يشترط أن اسم الكلاس = اسم الملف. Composer يتجاهل هذه الكلاسات مع تحذير، و `Route::get(..., [EditionController::class, ...])` سيفشل لاحقًا.
- **الإصلاح:** تصحيح الأسماء.

## 15. أخطاء في قاعدة البيانات (Migration تصحيحية)
**الملف الجديد:** `2026_11_07_000001_fix_catalog_schema_issues.php`

| المشكلة | الإصلاح |
|---|---|
| `edition_assets.edition_id` مربوط بجدول `people` | ربطه بـ `editions` |
| `book_credits.diaplay_order` | `display_order` |
| `publishers.website` إجباري | `nullable` |

- **المفهوم:** لماذا لم نعدل الـ Migrations القديمة؟ لأنها ربما نُفذت فعلًا على قاعدة بيانات. تعديلها لا يغير تلك القاعدة، فيصبح الكود والقاعدة مختلفين. الـ Migration المنفذة = تاريخ لا يُعدَّل، والتصحيح يكون دائمًا بـ Migration جديدة. (آخر commit سابق عدّل `create_books_table` القديمة، وهذا بالضبط ما نتجنبه.)

## 16. كلمات مرور داخل الـ Seeders
**الملفات:** `AdminUserSeeder`, `UserSeeder`, `UserRoleSeeder`, `DatabaseSeeder`

- **المشكلة:** كلمات مرور حقيقية وبريد gmail في مستودع عام. أرقام `user_id` و `role_id` مكتوبة يدويًا. و "Test User" بلا دور.
- **الإصلاح:**
  - بيانات الأدمن من `.env` (`SEED_ADMIN_*`)، مع كلمة عشوائية تُطبع إن لم تُحدد.
  - الحسابات التجريبية بنطاق `example.com`، ولا تُنشأ إلا في بيئة `local/testing`.
  - الأدوار تُسند بالبحث عن الـ `code`.
- **لماذا لم نُبقِ الكود القديم كتعليق هنا؟** لأنه يحتوي كلمات المرور نفسها. الفرق متاح في `git diff`.

## 17. Docker
تفاصيله في [DOCKER_SETUP.md](../DOCKER_SETUP.md). باختصار، الإعداد السابق لم يكن يشغل API قابلًا للوصول:
- لم يكن هناك Nginx.
- لم يكن هناك `composer install`.
- الحد الأقصى لرفع الملفات في PHP كان 2MB بينما الكتاب يصل إلى 20MB.
- بيانات MySQL كانت بلا Volume ثابت.
- كلمات المرور كانت داخل الملف.

`.env.example` أصبح على MySQL بدل SQLite.

---

## ما لم يُعدَّل (عمدًا)
- **المعمارية:** لم تُضف Services أو Repositories أو Form Requests أو API Resources. هذه مواضيع تعلم للمراحل القادمة، وسنراجعها معًا.
- **شكل الاستجابات** (`message`/`data`/`users`/`categories`) لم يتغير، حتى لا تنكسر أي تجربة سابقة. سيُوحَّد لاحقًا.
- **أسماء المسارات** لم تتغير.
- **ملاحظة معروفة:** `logout` و `CheckBanned` يستدعيان `currentAccessToken()->delete()`. يعمل مع Bearer Tokens، لكنه سيفشل لو استُخدمت مصادقة Sanctum بالـ Cookies. لا مشكلة حاليًا لأننا نعتمد Bearer.

## كيف تختبرين (Postman)
أضيفي الهيدر `Accept: application/json` دائمًا.

| الاختبار | المتوقع |
|---|---|
| `POST /api/register` | 201 + `user.roles` يحتوي `user` |
| `POST /api/login` لحساب محظور بكلمة مرور **خاطئة** | 401 (لا يكشف الحظر) |
| `POST /api/login` لحساب محظور بكلمة مرور **صحيحة** | 403 |
| 7 محاولات `login` خلال دقيقة | المحاولة السابعة 429 |
| `GET /api/user` بدون توكن | 401 JSON (وليس 500) |
| `PATCH /api/users/{id}` مع `email` | 200، أو 422 إن كان البريد مستخدمًا |
| `PUT /api/users/{id}/roles` مع `{"roles":[2]}` | 200 |
| `PUT /api/users/{myId}/roles` مع `{"roles":[2]}` من الأدمن نفسه | 403 |
| `POST /api/users/{myId}/ban` | 403 |
| `POST /api/books` مع ملف PDF | الملف داخل `storage/app/private/books/files` |
| `POST /api/books/{id}` بغلاف جديد | الغلاف القديم يُحذف، والـ `slug` لا يتغير |

---

# الدفعة 2: استكمال الميزات التي بدأت (بموافقة Dima)

> الهدف: تمكين الواجهة من العمل على ما هو موجود فعلًا، دون بناء ميزات جديدة بالكامل.

| # | التغيير | الملفات | المفهوم |
|---|---|---|---|
| 18 | `GET /books` أصبح **عامًا**، مع فلترة بالتصنيف (`category`)، وترتيب (`sort`)، و`per_page`، وترتيب افتراضي "الأحدث". قائمة الأدمن على `/admin/books`. | `BookController@index`, `routes/api.php` | `whereHas` للفلترة عبر علاقة، و`withQueryString()` للحفاظ على الفلاتر في روابط الصفحات |
| 19 | `GET /books/{slug}` لعرض كتاب واحد (عام). | `BookController@show` | البحث بالـ slug بدل الـ id في الروابط العامة |
| 20 | `DELETE /books/{id}` (أدمن، حذف ناعم). | `BookController@destroy` | SoftDeletes: لماذا لا نحذف الملفات هنا؟ لأن الحذف قابل للاسترجاع |
| 21 | `Book`: إخفاء `file_path` وإضافة `cover_url` و `has_ebook`. | `Models/Book.php` | `$hidden`، `$appends`، Accessors بـ `Attribute::make` |
| 22 | `User`: إضافة `image_url`. | `Models/User.php` | نفس المفهوم |
| 23 | `Category`: علاقات `parent`، `children`، `books`. | `Models/Category.php` | علاقات self-referencing و many-to-many |
| 24 | `GET /categories` أصبح **عامًا** (النشطة فقط + `books_count`). | `CategoryController@index` | `withCount` |
| 25 | إدارة التصنيفات للأدمن: `GET`, `POST /admin/categories` و `PATCH`, `DELETE /admin/categories/{id}`. الحذف ممنوع إذا كان التصنيف مرتبطًا بكتب. | `CategoryController` | `Rule::unique()->ignore()`, `Rule::notIn`، توليد slug فريد |
| 26 | قائمة المستخدمين: Pagination، بحث، فلتر الحالة، وإرجاع الأدوار وحالة الحظر. | `UserController@displayusers` | الاستعلام على عمود JSON: `where('ban_info->is_banned', true)` |
| 27 | `POST /users/{id}/unban`. | `UserController@unbanUser` | — |
| 28 | `GET /roles` لعرض الأدوار في لوحة التحكم. | `RoleController@index` | — |

**تنبيه تغيير شكل الاستجابة:** في `GET /users` أصبح `users` كائن Pagination (`users.data` هي المصفوفة).

## اختبار سريع (Postman)

| الطلب | المتوقع |
|---|---|
| `GET /api/books?category=philosophy-and-life-reflections&sort=title` بدون توكن | 200 |
| `GET /api/books/{slug}` | 200، بدون `file_path`، ومع `cover_url` و `has_ebook` |
| `GET /api/categories` بدون توكن | 200، النشطة فقط مع `books_count` |
| `DELETE /api/admin/categories/{id}` لتصنيف عليه كتب | 422 |
| `GET /api/users?status=banned&search=a` | المحظورون فقط |
