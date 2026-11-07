import "server-only";
import { isApiError, type FieldErrors } from "@/lib/api/errors";
import { isLocale, defaultLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary, type Dictionary } from "@/lib/i18n/get-dictionary";
import type { ActionState } from "./types";

/** اللغة تُرسل من كل نموذج كحقل مخفي اسمه lang (انظر components/ui/action-form) */
export async function actionI18n(formData: FormData): Promise<{ locale: Locale; dict: Dictionary }> {
  const raw = formData.get("lang");
  const locale = typeof raw === "string" && isLocale(raw) ? raw : defaultLocale;
  return { locale, dict: await getDictionary(locale) };
}

export function success(message?: string): ActionState {
  return { status: "success", message, at: Date.now() };
}

export function failure(message: string, fieldErrors: FieldErrors = {}): ActionState {
  return { status: "error", message, fieldErrors, at: Date.now() };
}

/**
 * يحول خطأ Laravel إلى رسالة مفهومة بلغة الواجهة.
 * رسائل الحقول (422) تأتي من Laravel كما هي.
 */
export function failureFromError(error: unknown, dict: Dictionary, overrides: Partial<Record<number, string>> = {}): ActionState {
  if (!isApiError(error)) {
    console.error(error);
    return failure(dict.errors.generic);
  }
  if (error.isMissingRoute) return failure(`${dict.pending.title}. ${dict.pending.description}`);
  if (overrides[error.status]) return failure(overrides[error.status]!, error.fieldErrors);
  switch (error.status) {
    case 0:
      return failure(dict.errors.network);
    case 401:
      return failure(dict.errors.unauthorized);
    case 403:
      // رسائل 403 من Laravel مفيدة (مثل: لا يمكنك حظر حسابك) لكنها بالعربية فقط
      return failure(error.message || dict.errors.forbidden);
    case 404:
      return failure(dict.errors.notFound);
    case 422:
      return failure(Object.keys(error.fieldErrors).length ? dict.errors.validation : error.message, error.fieldErrors);
    case 429:
      return failure(dict.errors.tooMany);
    default:
      return failure(dict.errors.server);
  }
}
