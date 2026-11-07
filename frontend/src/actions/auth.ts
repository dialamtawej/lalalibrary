"use server";

import { redirect } from "next/navigation";
import { apiFetch } from "@/lib/api/http";
import { isApiError } from "@/lib/api/errors";
import { clearToken, getToken, setToken } from "@/lib/auth/session";
import type { User } from "@/lib/api/types";
import { actionI18n, failure, failureFromError } from "@/lib/actions/state";
import type { ActionState } from "@/lib/actions/types";
import { safeNextPath } from "@/lib/utils";

type AuthResponse = { access_token: string; user: User };

function text(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { locale, dict } = await actionI18n(formData);
  const email = text(formData, "email");
  const password = String(formData.get("password") ?? "");

  let response: AuthResponse;
  try {
    response = await apiFetch<AuthResponse>("/login", {
      method: "POST",
      auth: "none",
      body: { email, password },
    });
  } catch (error) {
    if (isApiError(error)) {
      if (error.status === 401) return failure(dict.auth.invalidCredentials);
      if (error.status === 403) return failure(dict.auth.banned);
    }
    return failureFromError(error, dict);
  }

  await setToken(response.access_token);
  const next = safeNextPath(text(formData, "next"));
  redirect(`/${locale}${next ?? ""}`);
}

export async function registerAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { locale, dict } = await actionI18n(formData);
  const password = String(formData.get("password") ?? "");
  const confirmation = String(formData.get("password_confirmation") ?? "");

  if (password !== confirmation) {
    return failure(dict.errors.validation, { password_confirmation: dict.auth.passwordMismatch });
  }

  let response: AuthResponse;
  try {
    response = await apiFetch<AuthResponse>("/register", {
      method: "POST",
      auth: "none",
      body: {
        name: text(formData, "name"),
        email: text(formData, "email"),
        password,
        password_confirmation: confirmation,
      },
    });
  } catch (error) {
    return failureFromError(error, dict);
  }

  await setToken(response.access_token);
  redirect(`/${locale}`);
}

export async function logoutAction(formData: FormData): Promise<void> {
  const { locale } = await actionI18n(formData);
  if (await getToken()) {
    try {
      await apiFetch("/logout", { method: "POST" });
    } catch {
      // حتى لو فشل إبطال التوكن في Laravel (مثلًا انتهت صلاحيته) نحذف الكوكي محليًا
    }
  }
  await clearToken();
  redirect(`/${locale}`);
}
