"use server";

import { refresh } from "next/cache";
import { apiFetch } from "@/lib/api/http";
import { actionI18n, failure, failureFromError, success } from "@/lib/actions/state";
import type { ActionState } from "@/lib/actions/types";

export async function updateProfileAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { dict } = await actionI18n(formData);

  const body = new FormData();
  const name = String(formData.get("name") ?? "").trim();
  if (name) body.append("name", name);

  const image = formData.get("image");
  if (image instanceof File && image.size > 0) body.append("image", image);

  const password = String(formData.get("password") ?? "");
  if (password) {
    const confirmation = String(formData.get("password_confirmation") ?? "");
    if (password !== confirmation) {
      return failure(dict.errors.validation, { password_confirmation: dict.auth.passwordMismatch });
    }
    body.append("old_password", String(formData.get("old_password") ?? ""));
    body.append("password", password);
    body.append("password_confirmation", confirmation);
  }

  try {
    await apiFetch("/profile/update", { method: "POST", body });
  } catch (error) {
    return failureFromError(error, dict);
  }

  refresh();
  return success(dict.profile.saved);
}
