import { localeMeta, type Locale } from "@/lib/i18n/config";

/** دمج أسماء الكلاسات مع تجاهل القيم الفارغة */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(value: string | null | undefined, locale: Locale): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(localeMeta[locale].intl, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function formatNumber(value: number, locale: Locale): string {
  return new Intl.NumberFormat(localeMeta[locale].intl).format(value);
}

/** أول حرف من الاسم للصورة الرمزية */
export function initials(name: string): string {
  return name.trim().charAt(0).toUpperCase() || "?";
}

/** يقبل فقط مسارات داخلية آمنة لإعادة التوجيه بعد تسجيل الدخول */
export function safeNextPath(next: string | null | undefined): string | null {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.includes("\\")) return null;
  return next;
}

/** يحذف بادئة اللغة من المسار: /ar/books -> /books */
export function stripLocale(pathname: string): string {
  const stripped = pathname.replace(/^\/(ar|en)(?=\/|$)/, "");
  return stripped || "/";
}

/** قيمة searchParam كنص واحد */
export function param(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function pageParam(value: string | string[] | undefined): number {
  const n = Number(param(value));
  return Number.isInteger(n) && n > 0 ? n : 1;
}

/** السعر يأتي من Laravel كنص عشري ("12.00") لتجنب أخطاء الأعداد العشرية */
export function formatMoney(amount: string | number, currency: string, locale: Locale): string {
  const value = typeof amount === "number" ? amount : Number(amount);
  try {
    return new Intl.NumberFormat(localeMeta[locale].intl, { style: "currency", currency }).format(value);
  } catch {
    return `${amount} ${currency}`;
  }
}
