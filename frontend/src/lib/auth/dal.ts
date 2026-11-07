import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { apiFetch } from "@/lib/api/http";
import { isApiError } from "@/lib/api/errors";
import type { User } from "@/lib/api/types";
import type { Locale } from "@/lib/i18n/config";
import { getToken } from "./session";

/**
 * Data Access Layer للمستخدم الحالي.
 * cache() من React يضمن طلبًا واحدًا إلى /api/user لكل طلب صفحة،
 * حتى لو استدعته عدة مكونات.
 * يعيد null للزائر أو إذا كان التوكن منتهيًا/الحساب محظورًا (401/403).
 */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const token = await getToken();
  if (!token) return null;
  try {
    return await apiFetch<User>("/user");
  } catch (error) {
    if (isApiError(error) && (error.isUnauthorized || error.isForbidden)) return null;
    throw error;
  }
});

export function isAdmin(user: User | null | undefined): boolean {
  return !!user?.roles?.some((role) => role.code === "admin");
}

export function isBanned(user: Pick<User, "ban_info">): boolean {
  if (!user.ban_info?.is_banned) return false;
  const until = user.ban_info.ban_until;
  return !until || new Date(until).getTime() > Date.now();
}

export async function requireUser(locale: Locale, nextPath: string): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/login?next=${encodeURIComponent(nextPath)}`);
  return user;
}

export async function requireAdmin(locale: Locale, nextPath: string): Promise<User> {
  const user = await requireUser(locale, nextPath);
  if (!isAdmin(user)) redirect(`/${locale}`);
  return user;
}
