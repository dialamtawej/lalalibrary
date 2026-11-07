import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpenText, CalendarDays, ChevronLeft, ChevronRight, FileX2 } from "lucide-react";
import { getI18n } from "@/lib/i18n/server";
import { format, localeMeta, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/ar";
import type { Book, BookFull } from "@/lib/api/types";
import { isApiError } from "@/lib/api/errors";
import { listBooks } from "@/lib/services/catalog";
import { getBookFull } from "@/lib/services/features";
import { BookActions } from "@/components/books/book-actions";
import { ReviewsSection } from "@/components/reviews/reviews-section";
import { Stars } from "@/components/reviews/stars";
import { BookCover } from "@/components/books/book-cover";
import { BookCard, BookGrid } from "@/components/books/book-card";
import { ShareButton } from "@/components/books/share-button";
import { Badge, Skeleton } from "@/components/ui/misc";
import { LoadError } from "@/components/ui/load-error";
import { formatDate } from "@/lib/utils";

export async function generateMetadata({ params }: PageProps<"/[lang]/books/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  try {
    const book = await getBookFull(slug);
    return {
      title: book.title,
      description: book.description?.slice(0, 160) ?? undefined,
      openGraph: { title: book.title, images: book.cover_url ? [book.cover_url] : undefined, type: "book" },
    };
  } catch {
    return {};
  }
}

export default async function BookPage({ params }: PageProps<"/[lang]/books/[slug]">) {
  const { locale, dict } = await getI18n();
  return (
    <div className="container-page py-8 sm:py-12">
      <Suspense fallback={<BookSkeleton />}>
        <BookContent params={params} locale={locale} dict={dict} />
      </Suspense>
    </div>
  );
}

async function BookContent({ params, locale, dict }: { params: PageProps<"/[lang]/books/[slug]">["params"]; locale: Locale; dict: Dictionary }) {
  const { slug } = await params;
  let book: BookFull;
  try {
    book = await getBookFull(slug);
  } catch (error) {
    if (isApiError(error) && error.isNotFound) notFound();
    return <LoadError error={error} dict={dict} title={dict.books.loadError} />;
  }

  const Chevron = localeMeta[locale].dir === "rtl" ? ChevronLeft : ChevronRight;
  const added = formatDate(book.created_at, locale);
  const t = dict.books.details;

  return (
    <>
      <nav aria-label="breadcrumb" className="mb-8 text-sm">
        <ol className="flex flex-wrap items-center gap-1.5 text-muted">
          <li>
            <Link href={`/${locale}/books`} className="hover:text-ink-800">
              {t.breadcrumb}
            </Link>
          </li>
          {book.categories[0] ? (
            <>
              <li aria-hidden><Chevron className="size-4" /></li>
              <li>
                <Link href={`/${locale}/books?category=${encodeURIComponent(book.categories[0].slug)}`} className="hover:text-ink-800">
                  {book.categories[0].name}
                </Link>
              </li>
            </>
          ) : null}
          <li aria-hidden><Chevron className="size-4" /></li>
          <li aria-current="page" className="max-w-[16rem] truncate font-semibold text-ink-800">
            {book.title}
          </li>
        </ol>
      </nav>

      <article className="grid gap-10 lg:grid-cols-[minmax(0,20rem)_1fr] lg:gap-14">
        {/* الغلاف */}
        <div className="mx-auto w-full max-w-[16rem] lg:sticky lg:top-28 lg:max-w-none lg:self-start">
          <div className="rounded-3xl bg-gradient-to-b from-saffron-100 to-surface-2 p-8">
            <BookCover title={book.title} src={book.cover_url} seed={book.id} sizes="320px" priority />
          </div>
        </div>

        {/* التفاصيل */}
        <div className="min-w-0">
          {book.categories.length ? (
            <ul className="flex flex-wrap gap-2" aria-label={t.categories}>
              {book.categories.map((c) => (
                <li key={c.id}>
                  <Link href={`/${locale}/books?category=${encodeURIComponent(c.slug)}`}>
                    <Badge tone="plum" className="hover:bg-plum-100">
                      {c.name}
                    </Badge>
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}

          <h1 className="mt-4 font-display text-3xl font-bold leading-tight text-ink-900 sm:text-5xl">{book.title}</h1>

          {/* المؤلفون والتقييم (§2، §5) — تظهر تلقائيًا عند إضافتها في الـ API */}
          {book.authors?.length || book.rating ? (
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
              {book.authors?.length ? (
                <p className="text-lg text-muted">
                  {dict.bookExtra.by}{" "}
                  {book.authors.map((a, i) => (
                    <span key={a.id}>
                      {i > 0 ? "، " : null}
                      <Link href={`/${locale}/authors/${a.slug}`} className="font-semibold text-ink-800 hover:underline">
                        {a.name}
                      </Link>
                    </span>
                  ))}
                </p>
              ) : null}
              {book.rating && book.rating.count > 0 ? (
                <a href="#reviews-title" className="inline-flex items-center gap-2 text-sm text-muted">
                  <Stars value={book.rating.average} label={format(dict.reviews.outOf, { rating: book.rating.average.toFixed(1) })} />
                  {format(dict.reviews.count, { count: book.rating.count })}
                </a>
              ) : null}
            </div>
          ) : null}

          <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-sm">
            <div className="flex items-center gap-2">
              <dt className="sr-only">{t.availability}</dt>
              <dd>
                {book.has_ebook ? (
                  <Badge tone="saffron" icon={<BookOpenText className="size-3.5" aria-hidden />}>
                    {t.ebookAvailable}
                  </Badge>
                ) : (
                  <Badge tone="neutral" icon={<FileX2 className="size-3.5" aria-hidden />}>
                    {t.ebookUnavailable}
                  </Badge>
                )}
              </dd>
            </div>
            {added ? (
              <div className="flex items-center gap-2 text-muted">
                <CalendarDays className="size-4" aria-hidden />
                <dt>{t.added}</dt>
                <dd className="font-semibold text-ink-800">{added}</dd>
              </div>
            ) : null}
          </dl>

          <div className="mt-6">
            <ShareButton title={book.title} />
          </div>

          <section className="mt-10" aria-labelledby="about-book">
            <h2 id="about-book" className="text-lg font-bold text-ink-900">
              {t.about}
            </h2>
            {book.description ? (
              <p className="mt-3 max-w-[68ch] whitespace-pre-line text-lg leading-loose text-ink-800">{book.description}</p>
            ) : (
              <p className="mt-3 text-muted">{t.noDescription}</p>
            )}
          </section>

          <EditionsDetails book={book} locale={locale} dict={dict} />

          <div className="mt-10">
            <Suspense fallback={<Skeleton className="h-24 rounded-2xl" />}>
              <BookActions book={book} locale={locale} dict={dict} />
            </Suspense>
          </div>
        </div>
      </article>

      <Suspense fallback={null}>
        <ReviewsSection book={book} locale={locale} dict={dict} />
      </Suspense>

      {book.categories[0] ? (
        <Suspense fallback={null}>
          <RelatedBooks book={book} locale={locale} dict={dict} />
        </Suspense>
      ) : null}
    </>
  );
}

async function RelatedBooks({ book, locale, dict }: { book: Book; locale: Locale; dict: Dictionary }) {
  let related: Book[] = [];
  try {
    const page = await listBooks({ category: book.categories[0].slug, per_page: 6 });
    related = page.data.filter((b) => b.id !== book.id).slice(0, 5);
  } catch {
    return null;
  }
  if (!related.length) return null;
  return (
    <section className="mt-20" aria-labelledby="related-books">
      <span className="ornament" aria-hidden />
      <h2 id="related-books" className="mb-8 mt-2 font-display text-2xl font-bold text-ink-900">
        {dict.books.details.related}
      </h2>
      <BookGrid>
        {related.map((b) => (
          <BookCard key={b.id} book={b} locale={locale} dict={dict} />
        ))}
      </BookGrid>
    </section>
  );
}

function BookSkeleton() {
  return (
    <div className="grid gap-10 lg:grid-cols-[20rem_1fr]" aria-hidden>
      <Skeleton className="mx-auto aspect-[2/3] w-full max-w-[16rem] lg:max-w-none" />
      <div className="space-y-4">
        <Skeleton className="h-6 w-32 rounded-full" />
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-5 w-1/2" />
        <Skeleton className="mt-8 h-40 w-full" />
      </div>
    </div>
  );
}

/** معلومات النشر من النسخ (§2): اللغة، الصفحات، الناشر، التاريخ */
function EditionsDetails({ book, locale, dict }: { book: BookFull; locale: Locale; dict: Dictionary }) {
  if (!book.editions?.length) return null;
  const t = dict.bookExtra;
  return (
    <section className="mt-10" aria-labelledby="book-editions">
      <h2 id="book-editions" className="text-lg font-bold text-ink-900">
        {t.details}
      </h2>
      <ul className="mt-3 grid gap-3 sm:grid-cols-2">
        {book.editions.map((e) => (
          <li key={e.id} className="rounded-2xl bg-surface p-4 ring-1 ring-line">
            <Badge tone={e.format === "ebook" ? "saffron" : "ink"}>{t.formats[e.format]}</Badge>
            <dl className="mt-3 space-y-1 text-sm">
              {e.language ? (
                <div className="flex gap-2">
                  <dt className="text-muted">{t.language}:</dt>
                  <dd className="font-semibold">{e.language.name}</dd>
                </div>
              ) : null}
              {e.page_count ? (
                <div className="flex gap-2">
                  <dt className="sr-only">{t.pages}</dt>
                  <dd className="font-semibold">{format(t.pages, { count: e.page_count })}</dd>
                </div>
              ) : null}
              {e.publisher ? (
                <div className="flex gap-2">
                  <dt className="text-muted">{t.publisher}:</dt>
                  <dd className="font-semibold">{e.publisher.name}</dd>
                </div>
              ) : null}
              {e.publication_date ? (
                <div className="flex gap-2">
                  <dt className="text-muted">{t.published}:</dt>
                  <dd className="font-semibold">{formatDate(e.publication_date, locale)}</dd>
                </div>
              ) : null}
            </dl>
          </li>
        ))}
      </ul>
    </section>
  );
}
