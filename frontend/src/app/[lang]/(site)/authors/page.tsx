import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Feather, Search } from "lucide-react";
import { getI18n } from "@/lib/i18n/server";
import { format, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/ar";
import type { Author, Paginated } from "@/lib/api/types";
import { listAuthors } from "@/lib/services/features";
import { examples } from "@/lib/pending/examples";
import { apiPreviewEnabled, getCapabilities } from "@/lib/pending/capabilities";
import { FeatureGate } from "@/components/pending/feature-gate";
import { Input } from "@/components/ui/field";
import { Avatar, EmptyState, PageHeader, Skeleton } from "@/components/ui/misc";
import { Pagination } from "@/components/ui/pagination";
import { formatNumber, pageParam, param } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.authors.title, description: dict.authors.subtitle };
}

export default async function AuthorsPage({ searchParams }: PageProps<"/[lang]/authors">) {
  const { locale, dict } = await getI18n();
  return (
    <div className="container-page py-10 sm:py-14">
      <PageHeader title={dict.authors.title} description={dict.authors.subtitle} />
      <Suspense fallback={<GridSkeleton />}>
        <AuthorsContent searchParams={searchParams} locale={locale} dict={dict} />
      </Suspense>
    </div>
  );
}

async function AuthorsContent({ searchParams, locale, dict }: { searchParams: PageProps<"/[lang]/authors">["searchParams"]; locale: Locale; dict: Dictionary }) {
  const sp = await searchParams;
  const search = param(sp.search)?.trim() || undefined;
  const page = pageParam(sp.page);
  const showFilters = (await getCapabilities()).authors || apiPreviewEnabled();

  return (
    <>
      {/* البحث يظهر فقط عندما تكون الخدمة متاحة (أو في وضع المعاينة) */}
      {showFilters ? (
        <>
      <form method="get" action={`/${locale}/authors`} role="search" className="relative mt-8 max-w-xl">
        <label htmlFor="authors-search" className="sr-only">
          {dict.common.search}
        </label>
        <Search className="pointer-events-none absolute start-4 top-1/2 size-5 -translate-y-1/2 text-subtle" aria-hidden />
        <Input id="authors-search" name="search" type="search" defaultValue={search} placeholder={dict.authors.searchPlaceholder} className="ps-12" />
      </form>
        </>
      ) : null}
      <div className="mt-8">
        <FeatureGate feature="authors" dict={dict} load={() => listAuthors({ search, page, per_page: 24 })} example={examples.authors}>
          {(data) => <AuthorsGrid data={data} search={search} locale={locale} dict={dict} />}
        </FeatureGate>
      </div>
    </>
  );
}

function AuthorsGrid({ data, search, locale, dict }: { data: Paginated<Author>; search?: string; locale: Locale; dict: Dictionary }) {
  if (!data.data.length) return <EmptyState icon={<Feather className="size-6" aria-hidden />} title={dict.authors.empty} />;
  return (
    <>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.data.map((author) => (
          <li key={author.id}>
            <Link href={`/${locale}/authors/${author.slug}`} className="flex h-full items-center gap-4 rounded-[var(--radius-card)] bg-surface p-5 shadow-soft ring-1 ring-line transition-shadow hover:shadow-lift">
              <Avatar name={author.name} src={author.image_url} size="lg" />
              <span className="min-w-0">
                <span className="block truncate font-display text-xl font-bold text-ink-900">{author.name}</span>
                <span className="mt-1 block text-sm text-muted">{format(dict.authors.booksCount, { count: formatNumber(author.books_count, locale) })}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <Pagination meta={data} basePath={`/${locale}/authors`} query={{ search }} locale={locale} dict={dict} />
    </>
  );
}

function GridSkeleton() {
  return (
    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-hidden>
      {Array.from({ length: 6 }, (_, i) => (
        <Skeleton key={i} className="h-24 rounded-[var(--radius-card)]" />
      ))}
    </div>
  );
}
