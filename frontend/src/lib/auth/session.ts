import "server-only";
import { cookies } from "next/headers";

/**
 * التوكن (Sanctum Bearer) يُحفظ في Cookie من نوع httpOnly:
 * لا يستطيع JavaScript المتصفح قراءته، فلا يمكن سرقته عبر هجمات XSS.
 * خادم Next فقط يقرؤه ويرسله إلى Laravel في الهيدر Authorization.
 */
export const TOKEN_COOKIE = "lala_token";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 يومًا

export async function getToken(): Promise<string | undefined> {
  return (await cookies()).get(TOKEN_COOKIE)?.value;
}

/** يُستدعى من Server Actions فقط */
export async function setToken(token: string) {
  (await cookies()).set(TOKEN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

/** يُستدعى من Server Actions فقط */
export async function clearToken() {
  (await cookies()).delete(TOKEN_COOKIE);
}
