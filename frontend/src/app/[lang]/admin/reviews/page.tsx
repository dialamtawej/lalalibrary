import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Check, Flag, MessageSquareText, Trash2 } from "lucide-react";
import { getI18n } from "@/lib/i18n/server";
import { format, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/ar";
import type { Paginated, Review, ReviewReport } from "@/lib/api/types";
import { adminListReports, adminListReviews } from "@/lib/services/features";
import { examples } from "@/lib/pending/examples";
import { adminDeleteReviewAction, resolveReportAction } from "@/actions/admin-features";
import { FeatureGate } from "@/components/pending/feature-gate";
import { Stars } from "@/components/reviews/stars";
import { ActionButton } from "@/components/ui/action-button";
import { ConfirmAction } from "@/components/ui/confirm-action";
import { Avatar, Badge, EmptyState, PageHeader, Skeleton } from "@/components/ui/misc";
import { Pagination } from "@/components/ui/pagination";
import { cn, formatDate, pageParam, param } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.adminReviews.title };
}

export default async function AdminReviewsPage({ searchParams }: PageProps<"/[lang]/admin/reviews">) {
  const { locale, dict } = await getI18n();
  return (
    <div className="space-y-6">
      <PageHeader title={dict.adminReviews.title} />
      <Suspense fallback={<Skeleton className="h-80 rounded-[var(--radius-card)]" />}>
        <Content searchParams={searchParams} locale={locale} dict={dict} />
      </Suspense>
    </div>
  );
}

async function Content({ searchParams, locale, dict }: { searchParams: PageProps<"/[lang]/admin/reviews">["searchParams"]; locale: Locale; dict: Dictionary }) {
  const sp = await searchParams;
  const tab = param(sp.tab) === "all" ? "all" : "reports";
  const page = pageParam(sp.page);
  const base = `/${locale}/admin/reviews`;
  const t = dict.adminReviews;

  return (
    <>
      <nav className="flex gap-2" aria-label={t.title}>
        {(["reports", "all"] as const).map((k) => (
          <Link key={k} href={k === "all" ? `${base}?tab=all` : base} aria-current={tab === k ? "page" : undefined} className={cn("rounded-full px-4 py-2 text-sm font-semibold ring-1 ring-inset", tab === k ? "bg-ink-700 text-white ring-ink-700" : "ring-line-strong hover:bg-surface-2")}>
            {t.tabs[k]}
          </Link>
        ))}
      </nav>
      {tab === "reports" ? (
        <FeatureGate feature="adminReviews" dict={dict} load={() => adminListReports("open", page)} example={examples.reports}>
          {(data) => <Reports data={data} locale={locale} dict={dict} />}
        </FeatureGate>
      ) : (
        <FeatureGate feature="adminReviews" dict={dict} load={() => adminListReviews({ page })} example={examples.adminReviews}>
          {(data) => <AllReviews data={data} locale={locale} dict={dict} />}
        </FeatureGate>
      )}
    </>
  );
}

function ReviewBlock({ review, locale, dict }: { review: Review; locale: Locale; dict: Dictionary }) {
  return (
    <div className="flex items-start gap-3">
      <Avatar name={review.user.name} src={review.user.image_url} size="sm" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="font-semibold text-ink-900">{review.user.name}</span>
          <Stars value={review.rating} label={format(dict.reviews.outOf, { rating: review.rating })} />
          <span className="text-xs text-subtle">{formatDate(review.created_at, locale)}</span>
        </div>
        {review.book ? (
          <p className="mt-1 text-sm text-muted">
            {dict.adminReviews.onBook}{" "}
            <Link href={`/${locale}/books/${review.book.slug}`} className="font-semibold text-ink-700 hover:underline">
              {review.book.title}
            </Link>
          </p>
        ) : null}
        {review.body ? <p className="mt-2 whitespace-pre-line text-ink-800">{review.body}</p> : null}
      </div>
    </div>
  );
}

function Reports({ data, locale, dict }: { data: Paginated<ReviewReport>; locale: Locale; dict: Dictionary }) {
  const t = dict.adminReviews;
  if (!data.data.length) return <EmptyState icon={<Flag className="size-6" aria-hidden />} title={t.empty} />;
  return (
    <>
      <ul className="space-y-4">
        {data.data.map((r) => (
          <li key={r.id} className="rounded-[var(--radius-card)] bg-surface p-5 shadow-soft ring-1 ring-line">
            <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
              <Badge tone="danger" icon={<Flag className="size-3.5" aria-hidden />}>
                {dict.reviews.reasons[r.reason]}
              </Badge>
              <span className="text-muted">
                {t.reporter}: <span className="font-semibold text-ink-800">{r.reporter.name}</span>
              </span>
              {r.note ? <span className="text-muted">«{r.note}»</span> : null}
            </div>
            <ReviewBlock review={r.review} locale={locale} dict={dict} />
            <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
              <ActionButton action={resolveReportAction.bind(null, r.id, "dismiss")} variant="secondary" size="sm" icon={<Check className="size-4" aria-hidden />}>
                {t.dismiss}
              </ActionButton>
              <ActionButton action={resolveReportAction.bind(null, r.id, "delete_review")} variant="danger-soft" size="sm" icon={<Trash2 className="size-4" aria-hidden />}>
                {t.deleteReview}
              </ActionButton>
            </div>
          </li>
        ))}
      </ul>
      <Pagination meta={data} basePath={`/${locale}/admin/reviews`} query={{}} locale={locale} dict={dict} />
    </>
  );
}

function AllReviews({ data, locale, dict }: { data: Paginated<Review>; locale: Locale; dict: Dictionary }) {
  const t = dict.adminReviews;
  if (!data.data.length) return <EmptyState icon={<MessageSquareText className="size-6" aria-hidden />} title={t.emptyReviews} />;
  return (
    <>
      <ul className="divide-y divide-line rounded-[var(--radius-card)] bg-surface shadow-soft ring-1 ring-line">
        {data.data.map((review) => (
          <li key={review.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start">
            <div className="min-w-0 flex-1">
              <ReviewBlock review={review} locale={locale} dict={dict} />
              {review.reports_count ? <Badge tone="danger" className="mt-2">{format(t.reportsCount, { count: review.reports_count })}</Badge> : null}
            </div>
            <ConfirmAction
              action={adminDeleteReviewAction.bind(null, review.id)}
              title={dict.reviews.deleteTitle}
              description={dict.reviews.deleteBody}
              confirmLabel={dict.common.delete}
              trigger={t.deleteReview}
              triggerIcon={<Trash2 className="size-4" aria-hidden />}
            />
          </li>
        ))}
      </ul>
      <Pagination meta={data} basePath={`/${locale}/admin/reviews`} query={{ tab: "all" }} locale={locale} dict={dict} />
    </>
  );
}
