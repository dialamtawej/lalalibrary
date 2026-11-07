# مكتبة لالا — الواجهة (Next.js)

| | |
|---|---|
| الإطار | Next.js 16.4 (App Router، Cache Components، Turbopack) · React 19 · TypeScript |
| التنسيق | Tailwind CSS 4 مع Design Tokens في `src/app/globals.css` |
| الأيقونات | lucide-react |
| اللغات | العربية (RTL، الافتراضية) والإنجليزية (LTR) بروابط `/ar/...` و `/en/...` |

## التشغيل

مع Docker (من جذر المستودع): `docker compose up -d`، ثم افتحي `http://localhost:3000`.

بدون Docker (أسرع في Hot Reload على Windows):
```bash
cd frontend
cp .env.example .env.local   # LARAVEL_API_URL=http://localhost:8000/api
npm install
npm run dev
```

| الأمر | الوظيفة |
|---|---|
| `npm run dev` | خادم التطوير |
| `npm run build` | بناء الإنتاج (يفحص TypeScript أيضًا) |
| `npm run lint` | ESLint |
| `npx tsc --noEmit` | فحص الأنواع فقط |

## المعمارية

```
المتصفح ──► Next.js (Server Components + Server Actions) ──► Laravel API
                     └─ التوكن في Cookie من نوع httpOnly (lala_token)
```

- **المتصفح لا يتصل بـ Laravel مباشرة.** القراءة تتم في Server Components، والكتابة عبر Server Actions. التوكن لا يصل إلى JavaScript المتصفح، ولا نحتاج إعداد CORS.
- **الأغلفة والصور** تُعرض مباشرة من `http://localhost:8000/storage/...`، أي من `cover_url` و `image_url` القادمة من Laravel.
- **Cache Components مفعّل:** كل جزء يقرأ بيانات وقت الطلب (الكوكي، searchParams، params، طلبات API) يكون داخل `<Suspense>`، والباقي يُبنى مسبقًا كـ Static Shell.

```
src/
├─ app/
│  ├─ [lang]/                 الجذر حسب اللغة (layout.tsx = Root Layout)
│  │  ├─ (site)/              الموقع العام: الرئيسية، الكتب، التصنيفات، حسابي
│  │  ├─ (auth)/              الدخول والتسجيل
│  │  └─ admin/               لوحة التحكم (محمية للأدمن)
│  ├─ fonts/                  خطوط مستضافة محليًا (OFL)
│  └─ globals.css             الألوان والخطوط والـ Tokens
├─ proxy.ts                   بادئة اللغة + حماية تفاؤلية للصفحات المحمية
├─ actions/                   Server Actions (auth, profile, admin-*)
├─ components/
│  ├─ ui/                     مكونات عامة: Button, Field, ActionForm, Dialog, Pagination…
│  ├─ layout/                 Header, Footer, Navigation, Language switcher
│  ├─ books/                  BookCover, BookCard…
│  ├─ admin/                  مكونات لوحة التحكم
│  ├─ auth/ · account/
└─ lib/
   ├─ api/                    http.ts (fetch إلى Laravel)، types.ts، errors.ts
   ├─ auth/                   session.ts (الكوكي)، dal.ts (المستخدم الحالي والصلاحيات)
   ├─ services/               دوال جلب البيانات لكل Feature
   ├─ actions/                حالة النماذج وتحويل أخطاء Laravel
   ├─ i18n/                   القواميس (ar.ts, en.ts) وأدوات اللغة
   └─ utils/
```

## إضافة Feature جديدة (النمط المتبع)

1. أضيفي الأنواع في `lib/api/types.ts`.
2. أضيفي دوال القراءة في `lib/services/<feature>.ts`، وتستخدم `apiFetch`.
3. أضيفي الكتابة في `actions/<feature>.ts` باستخدام `"use server"`، وتعيد `ActionState`.
4. أضيفي النصوص في `ar.ts` ثم `en.ts`. TypeScript يرفض البناء إذا نقص مفتاح في الإنجليزية.
5. ابني الصفحة في `app/[lang]/...`، وضعي كل قراءة وقت الطلب داخل `<Suspense>`.
6. النماذج تستخدم `<ActionForm>`، وأخطاء Laravel (422) تظهر تحت الحقول تلقائيًا عبر `useFieldError`.

## الميزات بانتظار الباك إند

انظري `../docs/BACKEND_PENDING.md`.
