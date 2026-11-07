"use server";

import { refresh } from "next/cache";
import { apiFetch } from "@/lib/api/http";
import type { OrderStatus } from "@/lib/api/types";
import { actionI18n, failure, failureFromError, success } from "@/lib/actions/state";
import type { ActionState } from "@/lib/actions/types";

/** Server Actions لشاشات الأدمن الخاصة بالميزات في docs/BACKEND_PENDING.md */

function text(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

/* ---------- §2 Authors ---------- */

export async function saveAuthorAction(authorId: number | null, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const { dict } = await actionI18n(formData);
  const body = new FormData();
  body.append("name", text(formData, "name"));
  body.append("biography", text(formData, "biography"));
  const image = formData.get("image");
  if (image instanceof File && image.size > 0) body.append("image", image);
  try {
    await apiFetch(authorId ? `/admin/authors/${authorId}` : "/admin/authors", { method: "POST", body });
  } catch (error) {
    return failureFromError(error, dict);
  }
  refresh();
  return success(authorId ? dict.adminAuthors.updated : dict.adminAuthors.created);
}

export async function deleteAuthorAction(authorId: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const { dict } = await actionI18n(formData);
  try {
    await apiFetch(`/admin/authors/${authorId}`, { method: "DELETE" });
  } catch (error) {
    return failureFromError(error, dict, { 422: dict.adminAuthors.deleteBlocked });
  }
  refresh();
  return success(dict.adminAuthors.deleted);
}

/* ---------- §5 Reviews moderation ---------- */

export async function resolveReportAction(reportId: number, action: "dismiss" | "delete_review", _prev: ActionState, formData: FormData): Promise<ActionState> {
  const { dict } = await actionI18n(formData);
  try {
    await apiFetch(`/admin/reports/${reportId}`, { method: "PATCH", body: { status: "resolved", action } });
  } catch (error) {
    return failureFromError(error, dict);
  }
  refresh();
  return success(dict.adminReviews.resolved);
}

export async function adminDeleteReviewAction(reviewId: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const { dict } = await actionI18n(formData);
  try {
    await apiFetch(`/reviews/${reviewId}`, { method: "DELETE" });
  } catch (error) {
    return failureFromError(error, dict);
  }
  refresh();
  return success(dict.reviews.deleted);
}

/* ---------- §6 Products ---------- */

export async function updateProductAction(productId: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const { dict } = await actionI18n(formData);
  const price = text(formData, "price");
  const stock = Number(text(formData, "stock"));
  if (!/^\d+(\.\d{1,2})?$/.test(price) || !Number.isInteger(stock) || stock < 0) {
    return failure(dict.errors.validation);
  }
  try {
    await apiFetch(`/admin/products/${productId}`, {
      method: "PATCH",
      body: { price, stock, status: text(formData, "status") === "hidden" ? "hidden" : "active", shipping_info: text(formData, "shipping_info") || null },
    });
  } catch (error) {
    return failureFromError(error, dict);
  }
  refresh();
  return success(dict.adminProducts.updated);
}

/* ---------- §8 Orders ---------- */

const ORDER_STATUSES: OrderStatus[] = ["pending", "confirmed", "preparing", "shipped", "delivered", "cancelled"];

export async function updateOrderStatusAction(orderId: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const { dict } = await actionI18n(formData);
  const status = text(formData, "status") as OrderStatus;
  if (!ORDER_STATUSES.includes(status)) return failure(dict.errors.validation);
  try {
    await apiFetch(`/admin/orders/${orderId}/status`, { method: "PATCH", body: { status } });
  } catch (error) {
    // 422 من الباك إند = انتقال غير مسموح (مثل: من shipped إلى pending)
    return failureFromError(error, dict);
  }
  refresh();
  return success(dict.adminOrders.statusUpdated);
}
