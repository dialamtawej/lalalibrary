/**
 * عقود الـ API للميزات التي لم يُبنَ لها باك إند بعد.
 * المصدر: docs/BACKEND_PENDING.md (رقم القسم في section).
 *
 * تُستخدم في مكانين:
 * 1) فحص التوفر (capabilities.ts): يُطلب probe لكل ميزة؛ إن أعاد Laravel
 *    "The route ... could not be found" فالميزة غير مبنية بعد.
 * 2) وضع المعاينة للمطورين (SHOW_API_CONTRACTS=true): تُعرض الواجهة ببيانات
 *    المثال أدناه مع شارة واضحة "بيانات مثال"، ويُعرض العقد المطلوب.
 *    هذه البيانات لا تظهر أبدًا كبيانات حقيقية ولا تُستخدم خارج وضع المعاينة.
 */

export type FeatureKey =
  | "authors"
  | "adminAuthors"
  | "follow"
  | "reading"
  | "library"
  | "favorites"
  | "reviews"
  | "adminReviews"
  | "store"
  | "adminProducts"
  | "cart"
  | "orders"
  | "adminOrders"
  | "notifications"
  | "recommendations"
  | "stats";

export type Endpoint = { method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"; path: string; auth: "public" | "user" | "admin"; note?: string };

export type FeatureContract = {
  section: string;
  /** طلب GET بدون توكن يكفي لمعرفة إن كان المسار موجودًا */
  probe: string;
  endpoints: Endpoint[];
};

export const contracts: Record<FeatureKey, FeatureContract> = {
  authors: {
    section: "§2",
    probe: "/authors",
    endpoints: [
      { method: "GET", path: "/authors?search=&page=", auth: "public" },
      { method: "GET", path: "/authors/{slug}", auth: "public" },
      { method: "GET", path: "/books?author={slug}", auth: "public" },
    ],
  },
  adminAuthors: {
    section: "§2",
    probe: "/admin/authors",
    endpoints: [
      { method: "POST", path: "/admin/authors", auth: "admin", note: "multipart: name, biography?, image?" },
      { method: "POST", path: "/admin/authors/{id}", auth: "admin", note: "تعديل (multipart)" },
      { method: "DELETE", path: "/admin/authors/{id}", auth: "admin", note: "422 إذا كان مرتبطًا بكتب" },
    ],
  },
  follow: {
    section: "§10",
    probe: "/me/following",
    endpoints: [
      { method: "PUT", path: "/authors/{id}/follow", auth: "user" },
      { method: "DELETE", path: "/authors/{id}/follow", auth: "user" },
      { method: "GET", path: "/me/following", auth: "user" },
    ],
  },
  reading: {
    section: "§3",
    probe: "/books/__probe__/progress",
    endpoints: [
      { method: "GET", path: "/books/{slug}/read", auth: "user", note: "يبث ملف PDF (application/pdf)" },
      { method: "GET", path: "/books/{slug}/progress", auth: "user" },
      { method: "PUT", path: "/books/{slug}/progress", auth: "user", note: "{ page, total_pages }" },
    ],
  },
  library: {
    section: "§4",
    probe: "/me/library",
    endpoints: [
      { method: "GET", path: "/me/library?status=&page=", auth: "user" },
      { method: "PUT", path: "/me/library/{book_id}", auth: "user", note: "{ status }" },
      { method: "DELETE", path: "/me/library/{book_id}", auth: "user" },
      { method: "GET", path: "/books/{slug}", auth: "public", note: "يضيف viewer عند إرسال توكن" },
    ],
  },
  favorites: {
    section: "§4",
    probe: "/me/favorites",
    endpoints: [
      { method: "GET", path: "/me/favorites?page=", auth: "user" },
      { method: "PUT", path: "/me/favorites/{book_id}", auth: "user" },
      { method: "DELETE", path: "/me/favorites/{book_id}", auth: "user" },
    ],
  },
  reviews: {
    section: "§5",
    probe: "/books/__probe__/reviews",
    endpoints: [
      { method: "GET", path: "/books/{slug}/reviews?sort=latest|top&page=", auth: "public" },
      { method: "POST", path: "/books/{slug}/reviews", auth: "user", note: "{ rating: 1..5, body? }" },
      { method: "PATCH", path: "/reviews/{id}", auth: "user", note: "المالك فقط" },
      { method: "DELETE", path: "/reviews/{id}", auth: "user", note: "المالك أو الأدمن" },
      { method: "POST", path: "/reviews/{id}/report", auth: "user", note: "{ reason, note? }" },
    ],
  },
  adminReviews: {
    section: "§5",
    probe: "/admin/reviews",
    endpoints: [
      { method: "GET", path: "/admin/reviews?reported=1&search=&page=", auth: "admin" },
      { method: "GET", path: "/admin/reports?status=open|resolved", auth: "admin" },
      { method: "PATCH", path: "/admin/reports/{id}", auth: "admin", note: '{ status: "resolved", action: "dismiss"|"delete_review" }' },
      { method: "DELETE", path: "/reviews/{id}", auth: "admin" },
    ],
  },
  store: {
    section: "§6",
    probe: "/store/products",
    endpoints: [{ method: "GET", path: "/store/products?search=&category=&in_stock=1&page=", auth: "public" }],
  },
  adminProducts: {
    section: "§6",
    probe: "/admin/products",
    endpoints: [
      { method: "GET", path: "/admin/products?low_stock=1&page=", auth: "admin" },
      { method: "POST", path: "/admin/products", auth: "admin", note: "{ edition_id, price, currency, stock, shipping_info?, status }" },
      { method: "PATCH", path: "/admin/products/{id}", auth: "admin" },
    ],
  },
  cart: {
    section: "§7",
    probe: "/cart",
    endpoints: [
      { method: "GET", path: "/cart", auth: "user" },
      { method: "POST", path: "/cart/items", auth: "user", note: "{ product_id, quantity }" },
      { method: "PATCH", path: "/cart/items/{id}", auth: "user", note: "{ quantity }" },
      { method: "DELETE", path: "/cart/items/{id}", auth: "user" },
    ],
  },
  orders: {
    section: "§8",
    probe: "/orders",
    endpoints: [
      { method: "POST", path: "/orders", auth: "user", note: "{ name, phone, city, address, notes? } — من السلة، دفع عند الاستلام" },
      { method: "GET", path: "/orders?page=", auth: "user" },
      { method: "GET", path: "/orders/{id}", auth: "user" },
      { method: "POST", path: "/orders/{id}/cancel", auth: "user", note: "فقط pending" },
    ],
  },
  adminOrders: {
    section: "§8",
    probe: "/admin/orders",
    endpoints: [
      { method: "GET", path: "/admin/orders?status=&search=&page=", auth: "admin" },
      { method: "GET", path: "/admin/orders/{id}", auth: "admin" },
      { method: "PATCH", path: "/admin/orders/{id}/status", auth: "admin", note: "{ status } بانتقالات مسموحة" },
    ],
  },
  notifications: {
    section: "§10",
    probe: "/notifications/unread-count",
    endpoints: [
      { method: "GET", path: "/notifications?unread=1&page=", auth: "user" },
      { method: "GET", path: "/notifications/unread-count", auth: "user" },
      { method: "POST", path: "/notifications/{id}/read", auth: "user" },
      { method: "POST", path: "/notifications/read-all", auth: "user" },
    ],
  },
  recommendations: {
    section: "§11",
    probe: "/me/recommendations",
    endpoints: [
      { method: "GET", path: "/me/recommendations", auth: "user" },
      { method: "GET", path: "/books/{slug}/similar", auth: "public" },
    ],
  },
  stats: {
    section: "§12",
    probe: "/admin/stats",
    endpoints: [{ method: "GET", path: "/admin/stats", auth: "admin" }],
  },
};
