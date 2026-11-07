import type { ReactNode } from "react";
import { unstable_rethrow } from "next/navigation";
import { FlaskConical, Hourglass } from "lucide-react";
import { isApiError } from "@/lib/api/errors";
import type { Dictionary } from "@/lib/i18n/dictionaries/ar";
import { contracts, type FeatureKey } from "@/lib/pending/contracts";
import { apiPreviewEnabled } from "@/lib/pending/capabilities";
import { LoadError } from "@/components/ui/load-error";
import { cn } from "@/lib/utils";

/**
 * يحمّل بيانات ميزة من الـ API:
 *  - المسار موجود ⇒ يعرض children(data) — هذه هي الحالة النهائية بعد اكتمال الباك إند.
 *  - المسار غير موجود بعد ⇒ حالة "بانتظار الباك إند".
 *    وفي وضع المعاينة للمطورين: تُعرض الواجهة نفسها ببيانات المثال (غير قابلة للتفاعل)
 *    مع العقد المطلوب، حتى ترى مطورة الباك إند ما يجب أن يعيده الـ API بالضبط.
 */
export async function FeatureGate<T>({
  feature,
  load,
  example,
  dict,
  children,
  compact,
}: {
  feature: FeatureKey;
  load: () => Promise<T>;
  example: T;
  dict: Dictionary;
  children: (data: T) => ReactNode;
  compact?: boolean;
}) {
  let data: T;
  try {
    data = await load();
  } catch (error) {
    unstable_rethrow(error); // notFound() / redirect() من داخل load تمر كما هي
    if (isApiError(error) && error.isMissingRoute) {
      return apiPreviewEnabled() ? (
        <div className="space-y-4">
          <PendingNotice feature={feature} dict={dict} preview />
          <div inert className="pointer-events-none select-none rounded-[var(--radius-card)] outline-2 outline-offset-8 outline-dashed outline-saffron-300">
            {children(example)}
          </div>
        </div>
      ) : (
        <PendingNotice feature={feature} dict={dict} compact={compact} />
      );
    }
    return <LoadError error={error} dict={dict} title={dict.errors.generic} />;
  }
  return <>{children(data)}</>;
}

/** رسالة "بانتظار الباك إند" + (للمطورين) العقد المطلوب */
export function PendingNotice({ feature, dict, preview, compact, className }: { feature: FeatureKey; dict: Dictionary; preview?: boolean; compact?: boolean; className?: string }) {
  const info = dict.pendingFeatures[feature];
  const showContract = apiPreviewEnabled();
  const contract = contracts[feature];

  return (
    <section className={cn("rounded-[var(--radius-card)] border border-saffron-200 bg-saffron-50/80", compact ? "p-4" : "p-5 sm:p-6", className)}>
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-saffron-300 text-ink-900">
          {preview ? <FlaskConical className="size-5" aria-hidden /> : <Hourglass className="size-5" aria-hidden />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-saffron-700">{preview ? dict.pending.previewBadge : dict.pending.badge}</p>
          <h2 className="mt-0.5 font-bold text-ink-900">{info.title}</h2>
          <p className="mt-1 text-sm text-muted">{preview ? dict.pending.previewDescription : info.description}</p>
        </div>
      </div>

      {showContract ? (
        <details className="group mt-4 rounded-2xl bg-surface/80 p-4 ring-1 ring-saffron-200" open={preview}>
          <summary className="cursor-pointer text-sm font-bold text-ink-800">
            {dict.pending.contractTitle} · <span dir="ltr">docs/BACKEND_PENDING.md {contract.section}</span>
          </summary>
          <ul className="mt-3 space-y-2" dir="ltr">
            {contract.endpoints.map((e) => (
              <li key={e.method + e.path} className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-start font-mono text-xs">
                <span className={cn("rounded-md px-1.5 py-0.5 font-bold", methodTone[e.method])}>{e.method}</span>
                <code className="text-ink-900">/api{e.path}</code>
                <span className="rounded-md bg-surface-2 px-1.5 py-0.5 text-muted">{e.auth}</span>
                {e.note ? <span className="font-sans text-muted" dir="auto">{e.note}</span> : null}
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </section>
  );
}

const methodTone: Record<string, string> = {
  GET: "bg-info-soft text-info",
  POST: "bg-success-soft text-success",
  PUT: "bg-warning-soft text-warning",
  PATCH: "bg-warning-soft text-warning",
  DELETE: "bg-danger-soft text-danger",
};
