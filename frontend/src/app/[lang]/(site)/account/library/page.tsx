import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Library } from "lucide-react";
import { getI18n } from "@/lib/i18n/server";
import { format, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/ar";
import type { LibraryItem, LibraryStatus, Paginated } from "@/lib/api/types";
import { requireUser } from "@/lib/auth/dal";
import { listLibrary } from "@/lib/services/features";
import { examples } from "@/lib/pending/examples";
import { FeatureGate } from "@/components/pending/feature-gate";
import { BookCover } from "@/components/books/book-cover";
import { LibraryControl } from "@/components/books/library-control";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState, PageHeader, Skeleton } from "@/components/ui/misc";
import { Pagination } from "@/components/ui/pagination";
import { cn, pageParam, param } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.library.title, robots: { index: false } };
}

const STATUSES: LibraryStatus[] = ["want_to_read", "reading", "finished"];

export default async function LibraryPage({ searchParams }: PageProps<"/[lang]/account/library">) {
  const { locale, dict } = await getI18n();
  return (
    <>
      <PageHeader title={dict.library.title} description={dict.library.subtitle} />
      <Suspense fallback={<Skeleton className="mt-8 h-80 rounded-[var(--radius-card)]" />}>
        <LibraryContent searchParams={searchParams} locale={locale} dict={dict} />
      </Suspense>
    </>
  );
}

async function LibraryContent({ searchParams, locale, dict }: { searchParams: PageProps<"/[lang]/account/library">["searchParams"]; locale: Locale; dict: Dictionary }) {
  await requireUser(locale, "/account/library");
  const sp = await searchParams;
  const raw = param(sp.status) as LibraryStatus | undefined;
  const status = raw && STATUSES.includes(raw) ? raw : undefined;
  const page = pageParam(sp.page);
  const t = dict.library;
  const base = `/${locale}/account/library`;

  return (
    <>
      <nav aria-label={t.statusLabel} className="mt-6 flex flex-wrap gap-2">
        {[undefined, ...STATUSES].map((s) => (
          <Link
            key={s ?? "all"}
            href={s ? `${base}?status=${s}` : base}
            aria-current={status === s ? "page" : undefined}
            className={cn("rounded-full px-4 py-2 text-sm font-semibold ring-1 ring-inset", status === s ? "bg-saffron-400 text-ink-900 ring-saffron-400" : "text-ink-800 ring-line-strong hover:bg-surface-2")}
          >
            {s ? t.tabs[s] : t.tabs.all}
          </Link>
        ))}
      </nav>
      <div className="mt-8">
        <FeatureGate feature="library" dict={dict} load={() => listLibrary(status, page)} example={examples.library}>
          {(data) => <Shelf data={data} status={status} locale={locale} dict={dict} />}
        </FeatureGate>
      </div>
    </>
  );
}

function Shelf({ data, status, locale, dict }: { data: Paginated<LibraryItem>; status?: LibraryStatus; locale: Locale; dict: Dictionary }) {
  if (!data.data.length) {
    return <EmptyState icon={<Library className="size-6" aria-hidden />} title={dict.library.empty} description={dict.library.emptyHint} action={<ButtonLink href={`/${locale}/books`}>{dict.nav.books}</ButtonLink>} />;
  }
  return (
    <>
      <ul className="grid gap-4 sm:grid-cols-2">
        {data.data.map((item) => (
          <li key={item.book.id} className="flex gap-4 rounded-[var(--radius-card)] bg-surface p-4 shadow-soft ring-1 ring-line">
            <Link href={`/${locale}/books/${item.book.slug}`} className="w-20 shrink-0">
              <BookCover title={item.book.title} src={item.book.cover_url} seed={item.book.id} sizes="80px" />
            </Link>
            <div className="flex min-w-0 flex-1 flex-col gap-3">
              <Link href={`/${locale}/books/${item.book.slug}`} className="line-clamp-2 font-semibold text-ink-900 hover:underline">
                {item.book.title}
              </Link>
              {item.progress ? (
                <div>
                  <div className="h-2 overflow-hidden rounded-full bg-surface-2" role="progressbar" aria-valuenow={Math.round(item.progress.percent)} aria-valuemin={0} aria-valuemax={100}>
                    <div className="h-full rounded-full bg-saffron-400" style={{ width: `${item.progress.percent}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-muted">{format(dict.reader.progress, { percent: Math.round(item.progress.percent) })}</p>
                </div>
              ) : null}
              <div className="mt-auto flex flex-wrap items-center gap-2">
                <LibraryControl bookId={item.book.id} status={item.status} />
                {item.book.has_ebook && item.status !== "finished" ? (
                  <ButtonLink href={`/${locale}/read/${item.book.slug}`} size="sm">
                    {item.progress ? dict.reader.continueReading : dict.reader.readNow}
                  </ButtonLink>
                ) : null}
              </div>
            </div>
          </li>
        ))}
      </ul>
      <Pagination meta={data} basePath={`/${locale}/account/library`} query={{ status }} locale={locale} dict={dict} />
    </>
  );
}
