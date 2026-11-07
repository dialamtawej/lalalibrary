import { MessageSquareText } from "lucide-react";
import type { BookFull, Paginated, Review, User } from "@/lib/api/types";
import { format, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/ar";
import { getCurrentUser } from "@/lib/auth/dal";
import { listReviews } from "@/lib/services/features";
import { examples } from "@/lib/pending/examples";
import { FeatureGate } from "@/components/pending/feature-gate";
import { ButtonLink } from "@/components/ui/button";
import { Avatar } from "@/components/ui/misc";
import { formatDate, formatNumber } from "@/lib/utils";
import { Stars } from "./stars";
import { ReportReviewButton, ReviewForm } from "./review-forms";

/** قسم التقييمات في صفحة الكتاب (§5) */
export async function ReviewsSection({ book, locale, dict }: { book: BookFull; locale: Locale; dict: Dictionary }) {
  const user = await getCurrentUser().catch(() => null);
  return (
    <section className="mt-16" aria-labelledby="reviews-title">
      <span className="ornament" aria-hidden />
      <h2 id="reviews-title" className="mb-6 mt-2 font-display text-2xl font-bold text-ink-900">
        {dict.reviews.title}
      </h2>
      <FeatureGate feature="reviews" dict={dict} load={() => listReviews(book.slug)} example={examples.reviews}>
        {(page) => <ReviewsView book={book} page={page} user={user} locale={locale} dict={dict} />}
      </FeatureGate>
    </section>
  );
}

function ReviewsView({ book, page, user, locale, dict }: { book: BookFull; page: Paginated<Review>; user: User | null; locale: Locale; dict: Dictionary }) {
  const t = dict.reviews;
  const rating = book.rating;
  const mine = book.viewer?.my_review_id ? page.data.find((r) => r.id === book.viewer?.my_review_id) ?? null : null;
  const canWrite = !!user && (!book.viewer?.my_review_id || !!mine);

  return (
    <div className="grid gap-8 lg:grid-cols-[18rem_1fr]">
      <aside className="space-y-5">
        <div className="rounded-[var(--radius-card)] bg-surface p-6 text-center shadow-soft ring-1 ring-line">
          <p className="font-display text-5xl font-bold text-ink-900">{rating ? rating.average.toFixed(1) : "—"}</p>
          <div className="mt-2 flex justify-center">
            <Stars value={rating?.average ?? 0} size="md" label={format(t.outOf, { rating: rating?.average.toFixed(1) ?? 0 })} />
          </div>
          <p className="mt-2 text-sm text-muted">{format(t.count, { count: formatNumber(rating?.count ?? page.total, locale) })}</p>
        </div>
        {user ? null : (
          <ButtonLink href={`/${locale}/login?next=${encodeURIComponent(`/books/${book.slug}`)}`} variant="secondary" className="w-full">
            {t.loginToReview}
          </ButtonLink>
        )}
      </aside>

      <div className="space-y-6">
        {canWrite ? (
          <div>
            <h3 className="mb-3 font-bold text-ink-900">{mine ? t.yourReview : t.write}</h3>
            <ReviewForm slug={book.slug} existing={mine} />
          </div>
        ) : null}

        {page.data.length ? (
          <ul className="divide-y divide-line rounded-[var(--radius-card)] bg-surface shadow-soft ring-1 ring-line">
            {page.data.map((review) => (
              <li key={review.id} className="p-5">
                <div className="flex items-start gap-3">
                  <Avatar name={review.user.name} src={review.user.image_url} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <p className="font-semibold text-ink-900">{review.user.name}</p>
                      <Stars value={review.rating} label={format(t.outOf, { rating: review.rating })} />
                      <span className="text-xs text-subtle">
                        {formatDate(review.created_at, locale)}
                        {review.updated_at !== review.created_at ? ` · ${t.edited}` : ""}
                      </span>
                    </div>
                    {review.body ? <p className="mt-2 whitespace-pre-line leading-relaxed text-ink-800">{review.body}</p> : null}
                  </div>
                  {user && user.id !== review.user.id ? <ReportReviewButton reviewId={review.id} /> : null}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex items-center gap-3 rounded-2xl bg-surface-2/60 p-5 text-muted">
            <MessageSquareText className="size-5" aria-hidden />
            {t.noReviews}
          </div>
        )}
      </div>
    </div>
  );
}
