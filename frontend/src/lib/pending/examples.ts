import "server-only";
import type {
  AdminStats,
  AppNotification,
  Author,
  Book,
  Cart,
  LibraryItem,
  Order,
  Paginated,
  ReadingProgress,
  Recommendations,
  Review,
  ReviewReport,
  StoreProduct,
} from "@/lib/api/types";

/**
 * بيانات مثال مطابقة للعقود في docs/BACKEND_PENDING.md.
 * تُعرض فقط في وضع المعاينة للمطورين (SHOW_API_CONTRACTS=true) مع شارة "بيانات مثال".
 * لا تُستخدم أبدًا كبديل لبيانات حقيقية.
 */

const at = "2026-11-01T10:00:00.000000Z";

function page<T>(data: T[]): Paginated<T> {
  return { data, current_page: 1, last_page: 1, per_page: 15, total: data.length, from: data.length ? 1 : null, to: data.length || null };
}

const category = { id: 1, parent_id: null, name: "روايات عالمية ومترجمة", slug: "translated-and-world-novels", description: null, status: "active" as const };

function book(id: number, title: string, hasEbook = true): Book {
  return { id, title, slug: `example-book-${id}`, description: "وصف مختصر للكتاب كما يعيده الـ API.", cover_image: null, cover_url: null, has_ebook: hasEbook, created_at: at, updated_at: at, categories: [category] };
}

const reader = { id: 2, name: "سدرة", image_url: null };

export const examples = {
  authors: page<Author>([
    { id: 1, name: "مؤلف المثال", slug: "example-author-1", biography: "نبذة عن المؤلف كما تُخزن في جدول people.", image_url: null, books_count: 4, categories: [{ id: 1, name: category.name, slug: category.slug }] },
    { id: 2, name: "مؤلفة ثانية", slug: "example-author-2", biography: null, image_url: null, books_count: 2 },
    { id: 3, name: "Example Author", slug: "example-author-3", biography: null, image_url: null, books_count: 1 },
  ]),

  author: {
    id: 1,
    name: "مؤلف المثال",
    slug: "example-author-1",
    biography: "نبذة عن المؤلف: حياته وأعماله. يأتي هذا النص من الحقل biography.",
    image_url: null,
    books_count: 3,
    categories: [{ id: 1, name: category.name, slug: category.slug }],
    viewer: { is_following: false },
  } satisfies Author,

  progress: { page: 37, total_pages: 320, percent: 11.6, updated_at: at } satisfies ReadingProgress,

  library: page<LibraryItem>([
    { book: book(101, "رواية أقرؤها الآن"), status: "reading", added_at: at, progress: { page: 120, total_pages: 300, percent: 40, updated_at: at } },
    { book: book(102, "كتاب أريد قراءته", false), status: "want_to_read", added_at: at, progress: null },
    { book: book(103, "رواية أكملتها"), status: "finished", added_at: at, progress: { page: 250, total_pages: 250, percent: 100, updated_at: at } },
  ]),

  favorites: page<Book>([book(104, "كتاب مفضل"), book(105, "رواية مفضلة أخرى", false)]),

  reviews: page<Review>([
    { id: 1, rating: 5, body: "رواية جميلة جدًا، أنصح بها.", user: reader, created_at: at, updated_at: at },
    { id: 2, rating: 3, body: null, user: { id: 3, name: "دلاء", image_url: null }, created_at: at, updated_at: at },
  ]),

  adminReviews: page<Review>([
    { id: 7, rating: 1, body: "مراجعة عليها بلاغات.", user: reader, created_at: at, updated_at: at, book: { id: 1, title: "عنوان الكتاب", slug: "example-book-1" }, reports_count: 2 },
  ]),

  reports: page<ReviewReport>([
    { id: 1, reason: "spoiler", note: "تحرق أحداث النهاية", status: "open", review: { id: 7, rating: 1, body: "مراجعة عليها بلاغات.", user: reader, created_at: at, updated_at: at, book: { id: 1, title: "عنوان الكتاب", slug: "example-book-1" } }, reporter: { id: 3, name: "دلاء", image_url: null }, created_at: at },
  ]),

  products: page<StoreProduct>([
    { id: 1, price: "12.00", currency: "USD", stock: 7, in_stock: true, shipping_info: "التوصيل خلال 3-5 أيام", book: { id: 1, title: "نسخة ورقية متوفرة", slug: "example-book-1", cover_url: null, authors: [{ id: 1, name: "مؤلف المثال", slug: "example-author-1" }] } },
    { id: 2, price: "9.50", currency: "USD", stock: 1, in_stock: true, book: { id: 2, title: "آخر نسخة في المخزون", slug: "example-book-2", cover_url: null } },
    { id: 3, price: "15.00", currency: "USD", stock: 0, in_stock: false, book: { id: 3, title: "نسخة نفدت", slug: "example-book-3", cover_url: null } },
  ]),

  cart: {
    items: [
      { id: 1, quantity: 2, unit_price: "12.00", line_total: "24.00", available: true, product: { id: 1, stock: 7, book: { id: 1, title: "نسخة ورقية متوفرة", slug: "example-book-1", cover_url: null } } },
      { id: 2, quantity: 1, unit_price: "9.50", line_total: "9.50", available: true, product: { id: 2, stock: 1, book: { id: 2, title: "آخر نسخة في المخزون", slug: "example-book-2", cover_url: null } } },
    ],
    subtotal: "33.50",
    shipping: "3.00",
    total: "36.50",
    currency: "USD",
    count: 3,
  } satisfies Cart,

  order: {
    id: 15,
    number: "LL-000015",
    status: "shipped",
    payment_method: "cod",
    items: [{ title: "نسخة ورقية متوفرة", quantity: 2, unit_price: "12.00", line_total: "24.00", book_slug: "example-book-1" }],
    subtotal: "24.00",
    shipping: "3.00",
    total: "27.00",
    currency: "USD",
    shipping_address: { name: "سدرة", phone: "0999 000 000", city: "دمشق", address: "شارع المثال، بناء 3" },
    history: [
      { status: "pending", at: "2026-11-01T10:00:00Z" },
      { status: "confirmed", at: "2026-11-01T12:00:00Z" },
      { status: "preparing", at: "2026-11-02T09:00:00Z" },
      { status: "shipped", at: "2026-11-03T15:00:00Z" },
    ],
    created_at: "2026-11-01T10:00:00Z",
    user: { ...reader, email: "sdra@example.com" },
  } satisfies Order,

  orders: page<Order>([]),

  notifications: page<AppNotification>([
    { id: "a1", type: "order_status_changed", data: { type: "order_status_changed", title: "تم شحن طلبك LL-000015", body: "طلبك في الطريق إليك.", url: "/account/orders/15" }, read_at: null, created_at: at },
    { id: "a2", type: "author_new_book", data: { type: "author_new_book", title: "كتاب جديد لمؤلف تتابعه", body: "أُضيف كتاب جديد لمؤلف المثال.", url: "/books/example-book-1" }, read_at: at, created_at: at },
  ]),

  recommendations: {
    for_reading: [book(201, "قد يعجبك 1"), book(202, "قد يعجبك 2"), book(203, "قد يعجبك 3", false)],
    for_buying: [],
  } satisfies Recommendations,

  stats: {
    books: 120,
    users: 340,
    users_banned: 3,
    orders: { total: 58, pending: 4, revenue: "1240.00", currency: "USD" },
    reading: { active_readers_30d: 87 },
    reviews: { total: 210, reported_open: 2 },
    top_books: [{ id: 1, title: "الكتاب الأكثر قراءة", reads: 40 }, { id: 2, title: "كتاب آخر", reads: 28 }],
    low_stock: [{ product_id: 2, title: "آخر نسخة في المخزون", stock: 1 }],
  } satisfies AdminStats,
};

examples.orders = page<Order>([examples.order]);

export type Examples = typeof examples;
