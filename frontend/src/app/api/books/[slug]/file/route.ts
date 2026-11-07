import { cookies } from "next/headers";

const API_URL = (process.env.LARAVEL_API_URL ?? "http://localhost:8000/api").replace(/\/$/, "");

/**
 * وسيط لملف الكتاب (§3): المتصفح يطلب الملف من Next، و Next يطلبه من Laravel
 * مع التوكن من الكوكي (httpOnly). هكذا لا يظهر التوكن في المتصفح، ولا رابط مباشر للملف.
 * Laravel هو من يتحقق من الصلاحية: GET /api/books/{slug}/read
 */
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const token = (await cookies()).get("lala_token")?.value;
  if (!token) return Response.json({ message: "Unauthenticated." }, { status: 401 });

  let upstream: Response;
  try {
    upstream = await fetch(`${API_URL}/books/${encodeURIComponent(slug)}/read`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/pdf, application/json" },
      cache: "no-store",
    });
  } catch {
    return Response.json({ message: "Network error" }, { status: 502 });
  }

  if (!upstream.ok || !upstream.body) {
    const text = await upstream.text();
    return new Response(text, { status: upstream.status, headers: { "Content-Type": upstream.headers.get("Content-Type") ?? "application/json" } });
  }

  const headers = new Headers({
    "Content-Type": upstream.headers.get("Content-Type") ?? "application/pdf",
    "Cache-Control": "private, no-store",
    "Content-Disposition": "inline",
    "X-Content-Type-Options": "nosniff",
  });
  const length = upstream.headers.get("Content-Length");
  if (length) headers.set("Content-Length", length);
  return new Response(upstream.body, { status: 200, headers });
}
