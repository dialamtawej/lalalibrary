export type FieldErrors = Record<string, string>;

/**
 * خطأ موحّد لكل طلبات Laravel.
 * status = 0 يعني أن الخادم لم يُرد أصلًا (شبكة أو الباك إند متوقف).
 */
export class ApiError extends Error {
  readonly status: number;
  readonly fieldErrors: FieldErrors;

  constructor(status: number, message: string, fieldErrors: FieldErrors = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }

  get isUnauthorized() {
    return this.status === 401;
  }
  get isForbidden() {
    return this.status === 403;
  }
  get isNotFound() {
    return this.status === 404;
  }
  get isValidation() {
    return this.status === 422;
  }
  get isNetwork() {
    return this.status === 0;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/**
 * Laravel يعيد أخطاء التحقق بالشكل { errors: { field: [msg, ...] } }
 * والحقول المتداخلة بالشكل categories.0 — نعيدها إلى اسم الحقل الأساسي.
 */
export function flattenLaravelErrors(errors: unknown): FieldErrors {
  if (!errors || typeof errors !== "object") return {};
  const result: FieldErrors = {};
  for (const [key, value] of Object.entries(errors as Record<string, unknown>)) {
    const field = key.split(".")[0];
    const message = Array.isArray(value) ? String(value[0] ?? "") : String(value ?? "");
    if (message && !result[field]) result[field] = message;
  }
  return result;
}
