import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, isLocale, LOCALE_COOKIE, type Locale } from "@/lib/i18n/config";

const TOKEN_COOKIE = "lala_token";
/** صفحات تتطلب تسجيل الدخول (فحص تفاؤلي: وجود الكوكي فقط؛ الفحص الحقيقي في الصفحة) */
const PROTECTED = /^\/(ar|en)\/(admin|account|read|cart|checkout)(\/|$)/;

function preferredLocale(request: NextRequest): Locale {
  const saved = request.cookies.get(LOCALE_COOKIE)?.value;
  if (isLocale(saved)) return saved;
  const header = request.headers.get("accept-language") ?? "";
  for (const part of header.split(",")) {
    const code = part.split(";")[0]?.trim().slice(0, 2).toLowerCase();
    if (isLocale(code)) return code;
  }
  return defaultLocale;
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const segment = pathname.split("/")[1];

  // 1) إضافة بادئة اللغة إن لم تكن موجودة: /books -> /ar/books
  if (!isLocale(segment)) {
    const locale = preferredLocale(request);
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(url);
  }

  // 2) الصفحات المحمية بدون توكن -> صفحة الدخول مع العودة لنفس الصفحة بعدها
  if (PROTECTED.test(pathname) && !request.cookies.has(TOKEN_COOKIE)) {
    const url = request.nextUrl.clone();
    const rest = pathname.slice(segment.length + 1);
    url.pathname = `/${segment}/login`;
    url.search = `?next=${encodeURIComponent(rest + search)}`;
    return NextResponse.redirect(url);
  }

  // 3) تذكّر اللغة المختارة للزيارات القادمة
  const response = NextResponse.next();
  if (request.cookies.get(LOCALE_COOKIE)?.value !== segment) {
    response.cookies.set(LOCALE_COOKIE, segment, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  }
  return response;
}

export const config = {
  // كل المسارات ما عدا ملفات Next الداخلية والملفات الثابتة
  matcher: ["/((?!_next/|api/|favicon.ico|.*\\.[\\w]+$).*)"],
};
