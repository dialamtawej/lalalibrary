import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Paginated } from "@/lib/api/types";
import { format, localeMeta, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/ar";
import { cn, formatNumber } from "@/lib/utils";

type Props = {
  meta: Pick<Paginated<unknown>, "current_page" | "last_page" | "total" | "from" | "to">;
  basePath: string;
  query: Record<string, string | undefined>;
  locale: Locale;
  dict: Dictionary;
};

function pageWindow(current: number, last: number): (number | "gap")[] {
  const pages = new Set([1, last, current - 1, current, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= last).sort((a, b) => a - b);
  const result: (number | "gap")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) result.push("gap");
    result.push(p);
  });
  return result;
}

export function Pagination({ meta, basePath, query, locale, dict }: Props) {
  if (meta.last_page <= 1) return null;

  const href = (page: number) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(query)) if (v) params.set(k, v);
    if (page > 1) params.set("page", String(page));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  const rtl = localeMeta[locale].dir === "rtl";
  const PrevIcon = rtl ? ChevronRight : ChevronLeft;
  const NextIcon = rtl ? ChevronLeft : ChevronRight;
  const item = "grid h-10 min-w-10 place-items-center rounded-full px-3 text-sm font-semibold transition-colors";

  return (
    <nav aria-label={format(dict.common.pageOf, { page: meta.current_page, total: meta.last_page })} className="mt-10 flex flex-col items-center gap-3">
      <div className="flex flex-wrap items-center justify-center gap-1.5">
        {meta.current_page > 1 ? (
          <Link href={href(meta.current_page - 1)} className={cn(item, "gap-1 text-ink-700 hover:bg-ink-50")} rel="prev">
            <PrevIcon className="size-4" aria-hidden />
            <span className="hidden sm:inline">{dict.common.previous}</span>
          </Link>
        ) : null}
        {pageWindow(meta.current_page, meta.last_page).map((p, i) =>
          p === "gap" ? (
            <span key={`gap-${i}`} className="px-1 text-subtle" aria-hidden>
              …
            </span>
          ) : (
            <Link
              key={p}
              href={href(p)}
              aria-current={p === meta.current_page ? "page" : undefined}
              className={cn(item, p === meta.current_page ? "bg-ink-700 text-white" : "text-ink-700 hover:bg-ink-50")}
            >
              {formatNumber(p, locale)}
            </Link>
          ),
        )}
        {meta.current_page < meta.last_page ? (
          <Link href={href(meta.current_page + 1)} className={cn(item, "gap-1 text-ink-700 hover:bg-ink-50")} rel="next">
            <span className="hidden sm:inline">{dict.common.next}</span>
            <NextIcon className="size-4" aria-hidden />
          </Link>
        ) : null}
      </div>
      {meta.from && meta.to ? (
        <p className="text-sm text-subtle">
          {format(dict.common.showingRange, {
            from: formatNumber(meta.from, locale),
            to: formatNumber(meta.to, locale),
            total: formatNumber(meta.total, locale),
          })}
        </p>
      ) : null}
    </nav>
  );
}
