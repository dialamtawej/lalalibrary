"use server";

import { redirect } from "next/navigation";
import { refresh } from "next/cache";
import { apiFetch } from "@/lib/api/http";
import type { Book, Category } from "@/lib/api/types";
import { actionI18n, failure, failureFromError, success } from "@/lib/actions/state";
import type { ActionState } from "@/lib/actions/types";

function text(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

/** يبني FormData لـ Laravel من حقول نموذج الكتاب */
function bookPayload(formData: FormData): FormData {
  const body = new FormData();
  body.append("title", text(formData, "title"));
  body.append("description", text(formData, "description"));
  for (const id of formData.getAll("categories")) body.append("categories[]", String(id));

  const cover = formData.get("cover_image");
  if (cover instanceof File && cover.size > 0) body.append("cover_image", cover);

  const file = formData.get("file");
  if (file instanceof File && file.size > 0) body.append("file", file);
  return body;
}

/* ---------------- Books ---------------- */

export async function createBookAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { locale, dict } = await actionI18n(formData);
  if (formData.getAll("categories").length === 0) {
    return failure(dict.errors.validation, { categories: dict.admin.books.fields.categoriesHint });
  }
  try {
    await apiFetch<{ data: Book }>("/books", { method: "POST", body: bookPayload(formData) });
  } catch (error) {
    return failureFromError(error, dict);
  }
  redirect(`/${locale}/admin/books?created=1`);
}

export async function updateBookAction(bookId: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const { dict } = await actionI18n(formData);
  if (formData.getAll("categories").length === 0) {
    return failure(dict.errors.validation, { categories: dict.admin.books.fields.categoriesHint });
  }
  try {
    // POST وليس PUT: PHP لا يقرأ الملفات المرسلة multipart مع PUT
    await apiFetch(`/books/${bookId}`, { method: "POST", body: bookPayload(formData) });
  } catch (error) {
    return failureFromError(error, dict);
  }
  refresh();
  return success(dict.admin.books.updated);
}

export async function deleteBookAction(bookId: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const { locale, dict } = await actionI18n(formData);
  try {
    await apiFetch(`/books/${bookId}`, { method: "DELETE" });
  } catch (error) {
    return failureFromError(error, dict);
  }
  const redirectTo = text(formData, "redirect_to");
  if (redirectTo === "list") redirect(`/${locale}/admin/books`);
  refresh();
  return success(dict.admin.books.deleted);
}

/* ---------------- Categories ---------------- */

function categoryPayload(formData: FormData) {
  const parent = text(formData, "parent_id");
  const slug = text(formData, "slug");
  return {
    name: text(formData, "name"),
    description: text(formData, "description") || null,
    status: text(formData, "status") === "inactive" ? "inactive" : "active",
    parent_id: parent ? Number(parent) : null,
    ...(slug ? { slug } : {}),
  };
}

export async function saveCategoryAction(categoryId: number | null, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const { dict } = await actionI18n(formData);
  try {
    if (categoryId) {
      await apiFetch<{ category: Category }>(`/admin/categories/${categoryId}`, {
        method: "PATCH",
        body: categoryPayload(formData),
      });
    } else {
      await apiFetch<{ category: Category }>("/admin/categories", {
        method: "POST",
        body: categoryPayload(formData),
      });
    }
  } catch (error) {
    return failureFromError(error, dict);
  }
  refresh();
  return success(categoryId ? dict.admin.categories.updated : dict.admin.categories.created);
}

export async function deleteCategoryAction(categoryId: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const { dict } = await actionI18n(formData);
  try {
    await apiFetch(`/admin/categories/${categoryId}`, { method: "DELETE" });
  } catch (error) {
    return failureFromError(error, dict, { 422: dict.admin.categories.deleteBlocked });
  }
  refresh();
  return success(dict.admin.categories.deleted);
}
