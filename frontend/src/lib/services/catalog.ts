import "server-only";
import { cache } from "react";
import { apiFetch } from "@/lib/api/http";
import type { Book, BookQuery, Category, Paginated } from "@/lib/api/types";

/* ---------- Books (عام) ---------- */

export async function listBooks(query: BookQuery = {}): Promise<Paginated<Book>> {
  const res = await apiFetch<{ data: Paginated<Book> }>("/books", { query, auth: "none" });
  return res.data;
}

export async function getBook(slug: string): Promise<Book> {
  const res = await apiFetch<{ data: Book }>(`/books/${encodeURIComponent(slug)}`, { auth: "none" });
  return res.data;
}

/* ---------- Books (أدمن) ---------- */

export async function adminListBooks(query: BookQuery = {}): Promise<Paginated<Book>> {
  const res = await apiFetch<{ data: Paginated<Book> }>("/admin/books", { query });
  return res.data;
}

/* ---------- Categories ---------- */

export async function listCategories(): Promise<Category[]> {
  const res = await apiFetch<{ categories: Category[] }>("/categories", { auth: "none" });
  return res.categories;
}

export async function adminListCategories(): Promise<Category[]> {
  const res = await apiFetch<{ categories: Category[] }>("/admin/categories");
  return res.categories;
}

/** نسخ مع cache() من React لتجنب تكرار نفس الطلب داخل الصفحة الواحدة */
export const getLatestBooks = cache((count: number) => listBooks({ per_page: count, sort: "latest" }));
export const getCategories = cache(() => listCategories());
export const getBookCached = cache((slug: string) => getBook(slug));
