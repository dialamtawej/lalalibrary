"use server";

import { redirect } from "next/navigation";
import { refresh } from "next/cache";
import { apiFetch } from "@/lib/api/http";
import { actionI18n, failure, failureFromError, success } from "@/lib/actions/state";
import type { ActionState } from "@/lib/actions/types";

function text(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function updateUserAction(userId: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const { dict } = await actionI18n(formData);
  try {
    await apiFetch(`/users/${userId}`, {
      method: "PATCH",
      body: { name: text(formData, "name"), email: text(formData, "email") },
    });
  } catch (error) {
    return failureFromError(error, dict);
  }
  refresh();
  return success(dict.admin.users.updated);
}

export async function updateRolesAction(userId: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const { dict } = await actionI18n(formData);
  const roles = formData.getAll("roles").map(Number).filter(Number.isInteger);
  if (roles.length === 0) return failure(dict.admin.users.rolesHint, { roles: dict.admin.users.rolesHint });
  try {
    await apiFetch(`/users/${userId}/roles`, { method: "PUT", body: { roles } });
  } catch (error) {
    return failureFromError(error, dict);
  }
  refresh();
  return success(dict.admin.users.rolesUpdated);
}

export async function banUserAction(userId: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const { dict } = await actionI18n(formData);
  const type = text(formData, "type") === "temporary" ? "temporary" : "permanent";
  const banUntil = text(formData, "ban_until");
  try {
    await apiFetch(`/users/${userId}/ban`, {
      method: "POST",
      body: type === "temporary" ? { type, ban_until: banUntil } : { type },
    });
  } catch (error) {
    return failureFromError(error, dict);
  }
  refresh();
  return success(dict.admin.users.banned);
}

export async function unbanUserAction(userId: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const { dict } = await actionI18n(formData);
  try {
    await apiFetch(`/users/${userId}/unban`, { method: "POST" });
  } catch (error) {
    return failureFromError(error, dict);
  }
  refresh();
  return success(dict.admin.users.unbanned);
}

export async function resetPasswordAction(email: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const { dict } = await actionI18n(formData);
  const password = String(formData.get("password") ?? "");
  const confirmation = String(formData.get("password_confirmation") ?? "");
  if (password !== confirmation) {
    return failure(dict.errors.validation, { password_confirmation: dict.auth.passwordMismatch });
  }
  try {
    await apiFetch("/admin/reset-password", {
      method: "POST",
      body: { email, password, password_confirmation: confirmation },
    });
  } catch (error) {
    return failureFromError(error, dict);
  }
  return success(dict.admin.users.passwordReset);
}

export async function deleteUserAction(userId: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const { locale, dict } = await actionI18n(formData);
  try {
    await apiFetch(`/users/${userId}`, { method: "DELETE" });
  } catch (error) {
    return failureFromError(error, dict);
  }
  redirect(`/${locale}/admin/users`);
}
