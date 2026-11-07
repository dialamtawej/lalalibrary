import "server-only";
import { getToken } from "@/lib/auth/session";
import { ApiError, flattenLaravelErrors } from "./errors";

/**
 * عنوان Laravel API كما يراه خادم Next.js (وليس المتصفح).
 * - داخل Docker: http://nginx/api  (اسم الخدمة في الشبكة الداخلية)
 * - خارج Docker: http://localhost:8000/api
 * المتصفح لا يتصل بـ Laravel مباشرة أبدًا: كل الطلبات تمر عبر خادم Next،
 * فلا يظهر التوكن في JavaScript المتصفح ولا نحتاج إعداد CORS.
 */
const API_URL = (process.env.LARAVEL_API_URL ?? "http://localhost:8000/api").replace(/\/$/, "");

type Query = Record<string, string | number | boolean | undefined | null>;

export type ApiRequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  query?: Query;
  /** JSON object أو FormData (لرفع الملفات) */
  body?: unknown;
  /** auth: يرسل التوكن إن وُجد (الافتراضي) — none: لا يرسله */
  auth?: "auto" | "none";
  /** توكن صريح (مثلًا بعد تسجيل الدخول مباشرة قبل حفظ الكوكي) */
  token?: string;
};

function buildUrl(path: string, query?: Query) {
  const url = new URL(`${API_URL}${path.startsWith("/") ? path : `/${path}`}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url;
}

export async function apiFetch<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { method = "GET", query, body, auth = "auto" } = options;

  const headers: Record<string, string> = { Accept: "application/json" };
  const token = options.token ?? (auth === "auto" ? await getToken() : undefined);
  if (token) headers.Authorization = `Bearer ${token}`;

  let payload: BodyInit | undefined;
  if (body instanceof FormData) {
    payload = body; // fetch يضبط Content-Type و boundary تلقائيًا
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: payload,
      cache: "no-store",
    });
  } catch {
    throw new ApiError(0, "Network error");
  }

  const text = await response.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const json = (data ?? {}) as { message?: string; errors?: unknown };
    throw new ApiError(
      response.status,
      json.message ?? response.statusText,
      flattenLaravelErrors(json.errors),
    );
  }

  return data as T;
}
