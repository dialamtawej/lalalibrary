import "server-only";
import { cacheLife } from "next/cache";
import { apiFetch } from "@/lib/api/http";
import { ApiError, isApiError } from "@/lib/api/errors";
import { contracts, type FeatureKey } from "./contracts";

export type Capabilities = Record<FeatureKey, boolean>;

/**
 * أي الميزات بنتها مطورة الباك إند فعلًا؟
 * نرسل طلب GET بدون توكن لكل ميزة:
 *  - 200 / 401 / 403 / 405 / 422 / 404 لعنصر  ← المسار موجود ⇒ الميزة متاحة
 *  - 404 "The route ... could not be found"     ← لم تُبنَ بعد
 *  - فشل الاتصال                                 ← غير متاحة الآن
 * النتيجة مخزنة لدقائق، فعند إضافة الـ Endpoint في Laravel
 * تتفعّل الواجهة تلقائيًا خلال دقائق دون تعديل أي كود.
 */
export async function getCapabilities(): Promise<Capabilities> {
  "use cache";
  cacheLife("minutes");

  const entries = await Promise.all(
    (Object.keys(contracts) as FeatureKey[]).map(async (key) => {
      try {
        await apiFetch(contracts[key].probe, { auth: "none" });
        return [key, true] as const;
      } catch (error) {
        if (isApiError(error) && !error.isNetwork && !error.isMissingRoute) return [key, true] as const;
        return [key, false] as const;
      }
    }),
  );
  return Object.fromEntries(entries) as Capabilities;
}

/** وضع المعاينة للمطورين: عرض الواجهة ببيانات مثال + عقد الـ API */
export function apiPreviewEnabled(): boolean {
  return process.env.SHOW_API_CONTRACTS === "true";
}

/**
 * لصفحة تعتمد على أكثر من ميزة (مثل إتمام الطلب: السلة + الطلبات):
 * إن لم تكن الميزة متاحة نرمي نفس خطأ "المسار غير موجود" فتعرض FeatureGate حالة الانتظار.
 */
export async function assertAvailable(feature: FeatureKey): Promise<void> {
  const caps = await getCapabilities();
  if (!caps[feature]) throw new ApiError(404, `The route api${contracts[feature].probe} could not be found.`);
}
