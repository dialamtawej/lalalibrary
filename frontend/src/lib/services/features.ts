import "server-only";
import { cache } from "react";
import { apiFetch, apiPage } from "@/lib/api/http";
import type {
  AdminStats,
  AppNotification,
  Author,
  Book,
  BookFull,
  Cart,
  LibraryItem,
  LibraryStatus,
  Order,
  OrderStatus,
  Paginated,
  ReadingProgress,
  Recommendations,
  Review,
  ReviewReport,
  StoreProduct,
} from "@/lib/api/types";

/**
 * دوال القراءة للميزات المعرّفة في docs/BACKEND_PENDING.md.
 * كل دالة تطابق Endpoint واحدًا في العقد. حتى يُبنى الـ Endpoint في Laravel
 * ترمي ApiError بخاصية isMissingRoute، وتتعامل معها FeatureGate.
 */

type Q = Record<string, string | number | undefined>;

/* ---------- §2 Books (full) & Authors ---------- */

/** الكتاب مع حقول §2/§4/§5 إن وُجدت؛ يرسل التوكن حتى يُعاد viewer */
export const getBookFull = cache(async (slug: string): Promise<BookFull> => {
  const res = await apiFetch<{ data: BookFull }>(`/books/${encodeURIComponent(slug)}`);
  return res.data;
});

export async function listAuthors(query: Q = {}): Promise<Paginated<Author>> {
  return apiPage<Author>("/authors", { query });
}

export const getAuthor = cache(async (slug: string): Promise<Author> => {
  const res = await apiFetch<{ data: Author }>(`/authors/${encodeURIComponent(slug)}`);
  return res.data;
});

export async function listAuthorBooks(slug: string, page = 1): Promise<Paginated<Book>> {
  return apiPage<Book>("/books", { query: { author: slug, page, per_page: 20 }, auth: "none" });
}

/* ---------- §3 Reading ---------- */

export async function getProgress(slug: string): Promise<ReadingProgress | null> {
  const res = await apiFetch<{ data: ReadingProgress | null }>(`/books/${encodeURIComponent(slug)}/progress`);
  return res.data;
}

/* ---------- §4 Library & Favorites ---------- */

export async function listLibrary(status: LibraryStatus | undefined, page = 1): Promise<Paginated<LibraryItem>> {
  return apiPage<LibraryItem>("/me/library", { query: { status, page } });
}

export async function listFavorites(page = 1): Promise<Paginated<Book>> {
  return apiPage<Book>("/me/favorites", { query: { page } });
}

/* ---------- §5 Reviews ---------- */

export async function listReviews(slug: string, sort: "latest" | "top" = "latest", page = 1): Promise<Paginated<Review>> {
  return apiPage<Review>(`/books/${encodeURIComponent(slug)}/reviews`, { query: { sort, page }, auth: "none" });
}

export async function adminListReviews(query: Q = {}): Promise<Paginated<Review>> {
  return apiPage<Review>("/admin/reviews", { query });
}

export async function adminListReports(status: "open" | "resolved" = "open", page = 1): Promise<Paginated<ReviewReport>> {
  return apiPage<ReviewReport>("/admin/reports", { query: { status, page } });
}

/* ---------- §6 Store ---------- */

export async function listProducts(query: Q = {}): Promise<Paginated<StoreProduct>> {
  return apiPage<StoreProduct>("/store/products", { query, auth: "none" });
}

export async function adminListProducts(query: Q = {}): Promise<Paginated<StoreProduct>> {
  return apiPage<StoreProduct>("/admin/products", { query });
}

/* ---------- §7 Cart ---------- */

export const getCart = cache(async (): Promise<Cart> => {
  const res = await apiFetch<{ data: Cart }>("/cart");
  return res.data;
});

/* ---------- §8 Orders ---------- */

export async function listOrders(page = 1): Promise<Paginated<Order>> {
  return apiPage<Order>("/orders", { query: { page } });
}

export async function getOrder(id: string | number): Promise<Order> {
  const res = await apiFetch<{ data: Order }>(`/orders/${encodeURIComponent(String(id))}`);
  return res.data;
}

export async function adminListOrders(query: { status?: OrderStatus; search?: string; page?: number } = {}): Promise<Paginated<Order>> {
  return apiPage<Order>("/admin/orders", { query });
}

export async function adminGetOrder(id: string | number): Promise<Order> {
  const res = await apiFetch<{ data: Order }>(`/admin/orders/${encodeURIComponent(String(id))}`);
  return res.data;
}

/* ---------- §10 Notifications ---------- */

export async function listNotifications(unreadOnly: boolean, page = 1): Promise<Paginated<AppNotification>> {
  return apiPage<AppNotification>("/notifications", { query: { unread: unreadOnly ? 1 : undefined, page } });
}

export const getUnreadCount = cache(async (): Promise<number> => {
  const res = await apiFetch<{ count: number }>("/notifications/unread-count");
  return res.count;
});

/* ---------- §11 Recommendations ---------- */

export async function getRecommendations(): Promise<Recommendations> {
  const res = await apiFetch<{ data: Recommendations }>("/me/recommendations");
  return res.data;
}

/* ---------- §12 Stats ---------- */

export async function getAdminStats(): Promise<AdminStats> {
  const res = await apiFetch<{ data: AdminStats }>("/admin/stats");
  return res.data;
}
