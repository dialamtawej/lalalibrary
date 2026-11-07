"use server";

import { redirect } from "next/navigation";
import { refresh } from "next/cache";
import { apiFetch } from "@/lib/api/http";
import type { LibraryStatus, Order } from "@/lib/api/types";
import { actionI18n, failure, failureFromError, success } from "@/lib/actions/state";
import type { ActionState } from "@/lib/actions/types";

/**
 * Server Actions للميزات في docs/BACKEND_PENDING.md (المستخدم المسجل).
 * كل دالة تستدعي Endpoint واحدًا من العقد.
 */

function text(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

async function run(formData: FormData, call: () => Promise<unknown>, message: (d: Awaited<ReturnType<typeof actionI18n>>["dict"]) => string): Promise<ActionState> {
  const { dict } = await actionI18n(formData);
  try {
    await call();
  } catch (error) {
    return failureFromError(error, dict);
  }
  refresh();
  return success(message(dict));
}

/* ---------- §10 Follow ---------- */

export async function followAuthorAction(authorId: number, follow: boolean, _prev: ActionState, formData: FormData) {
  return run(formData, () => apiFetch(`/authors/${authorId}/follow`, { method: follow ? "PUT" : "DELETE" }), () => "");
}

/* ---------- §4 Library & Favorites ---------- */

const STATUSES: LibraryStatus[] = ["want_to_read", "reading", "finished"];

export async function setLibraryStatusAction(bookId: number, _prev: ActionState, formData: FormData) {
  const status = text(formData, "status");
  if (status === "remove") {
    return run(formData, () => apiFetch(`/me/library/${bookId}`, { method: "DELETE" }), (d) => d.library.removed);
  }
  if (!STATUSES.includes(status as LibraryStatus)) {
    const { dict } = await actionI18n(formData);
    return failure(dict.errors.validation);
  }
  return run(formData, () => apiFetch(`/me/library/${bookId}`, { method: "PUT", body: { status } }), (d) => d.library.updated);
}

export async function toggleFavoriteAction(bookId: number, add: boolean, _prev: ActionState, formData: FormData) {
  return run(formData, () => apiFetch(`/me/favorites/${bookId}`, { method: add ? "PUT" : "DELETE" }), () => "");
}

/* ---------- §3 Reading progress (يُستدعى من القارئ مباشرة) ---------- */

export async function saveProgressAction(slug: string, page: number, totalPages: number): Promise<boolean> {
  if (!Number.isInteger(page) || !Number.isInteger(totalPages) || page < 1 || page > totalPages) return false;
  try {
    await apiFetch(`/books/${encodeURIComponent(slug)}/progress`, { method: "PUT", body: { page, total_pages: totalPages } });
    return true;
  } catch {
    return false;
  }
}

/* ---------- §5 Reviews ---------- */

export async function saveReviewAction(slug: string, reviewId: number | null, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const { dict } = await actionI18n(formData);
  const rating = Number(formData.get("rating"));
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return failure(dict.errors.validation, { rating: dict.reviews.ratingRequired });
  }
  const body = { rating, body: text(formData, "body") || null };
  return run(
    formData,
    () =>
      reviewId
        ? apiFetch(`/reviews/${reviewId}`, { method: "PATCH", body })
        : apiFetch(`/books/${encodeURIComponent(slug)}/reviews`, { method: "POST", body }),
    (d) => d.reviews.saved,
  );
}

export async function deleteReviewAction(reviewId: number, _prev: ActionState, formData: FormData) {
  return run(formData, () => apiFetch(`/reviews/${reviewId}`, { method: "DELETE" }), (d) => d.reviews.deleted);
}

export async function reportReviewAction(reviewId: number, _prev: ActionState, formData: FormData) {
  const body = { reason: text(formData, "reason") || "other", note: text(formData, "note") || null };
  return run(formData, () => apiFetch(`/reviews/${reviewId}/report`, { method: "POST", body }), (d) => d.reviews.reported);
}

/* ---------- §7 Cart ---------- */

export async function addToCartAction(productId: number, _prev: ActionState, formData: FormData) {
  const quantity = Math.max(1, Math.min(10, Number(formData.get("quantity")) || 1));
  return run(formData, () => apiFetch("/cart/items", { method: "POST", body: { product_id: productId, quantity } }), (d) => d.store.added);
}

export async function updateCartItemAction(itemId: number, _prev: ActionState, formData: FormData) {
  const quantity = Math.max(1, Math.min(10, Number(formData.get("quantity")) || 1));
  return run(formData, () => apiFetch(`/cart/items/${itemId}`, { method: "PATCH", body: { quantity } }), (d) => d.cart.updated);
}

export async function removeCartItemAction(itemId: number, _prev: ActionState, formData: FormData) {
  return run(formData, () => apiFetch(`/cart/items/${itemId}`, { method: "DELETE" }), (d) => d.cart.removed);
}

/* ---------- §8 Orders ---------- */

export async function placeOrderAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { locale, dict } = await actionI18n(formData);
  let order: Order;
  try {
    const res = await apiFetch<{ data: Order }>("/orders", {
      method: "POST",
      body: {
        name: text(formData, "name"),
        phone: text(formData, "phone"),
        city: text(formData, "city"),
        address: text(formData, "address"),
        notes: text(formData, "notes") || null,
      },
    });
    order = res.data;
  } catch (error) {
    return failureFromError(error, dict);
  }
  redirect(`/${locale}/account/orders/${order.id}?placed=1`);
}

export async function cancelOrderAction(orderId: number, _prev: ActionState, formData: FormData) {
  return run(formData, () => apiFetch(`/orders/${orderId}/cancel`, { method: "POST" }), (d) => d.orders.cancelled);
}

/* ---------- §10 Notifications ---------- */

export async function markNotificationReadAction(id: string, _prev: ActionState, formData: FormData) {
  return run(formData, () => apiFetch(`/notifications/${encodeURIComponent(id)}/read`, { method: "POST" }), () => "");
}

export async function markAllNotificationsReadAction(_prev: ActionState, formData: FormData) {
  return run(formData, () => apiFetch("/notifications/read-all", { method: "POST" }), () => "");
}
