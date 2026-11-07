import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { BookOpenText, Search, SearchX, X } from "lucide-react";
import { getI18n } from "@/lib/i18n/server";
import { format, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/ar";
import type { BookSort, Category } from "@/lib/api/types";
import { getCategories, listBooks } from "@/lib/services/catalog";
import { BookCard, BookGrid, BookGridSkeleton } from "@/components/books/book-card";
import { AutoSubmitSelect } from "@/components/books/auto-submit-select";
import { Input } from "@/components/ui/field";
import { EmptyState, PageHeader, Skeleton } from "@/components/ui/misc";
import { Pagination } from "@/components/ui/pagination";
import { LoadError } from "@/components/ui/load-error";
import { ButtonLink } from "@/components/ui/button";
import { formatNumber, pageParam, param } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.books.title, description: dict.books.subtitle };
}

const SORTS: BookSort[] = ["latest", "oldest", "title"];

type Filters = { search?: string; category?: string; sort: BookSort; page: number };

export default async function BooksPage({ searchParams }: PageProps<"/[lang]/books">) {
  const { locale, dict } = await getI18n();
  return (
    <div className="container-page py-10 sm:py-14">
      <PageHeader title={dict.books.title} description={dict.books.subtitle} />
      <Suspense fallback={<CatalogSkeleton />}>
        <Catalog searchParams={searchParams} locale={locale} dict={dict} />
      </Suspense>
    </div>
  );
}

async function Catalog({ searchParams, locale, dict }: { searchParams: PageProps<"/[lang]/books">["searchParams"]; locale: Locale; dict: Dictionary }) {
  const sp = await searchParams;
  const sortRaw = param(sp.sort) as BookSort | undefined;
  const filters: Filters = {
    search: param(sp.search)?.trim() || undefined,
    category: param(sp.category) || undefined,
    sort: sortRaw && SORTS.includes(sortRaw) ? sortRaw : "latest",
    page: pageParam(sp.page),
  };

  let categories: Category[] = [];
  try {
    categories = await getCategories();
  } catch {
    // الفلاتر تعمل بدون قائمة التصنيفات (البحث والترتيب)
  }

  const key = JSON.stringify(filters);
  return (
    <>
      <FilterBar filters={filters} categories={categories} locale={locale} dict={dict} />
      <Suspense key={key} fallback={<BookGridSkeleton count={10} />}>
        <Results filters={filters} categories={categories} locale={locale} dict={dict} />
      </Suspense>
    </>
  );
}

function FilterBar({ filters, categories, locale, dict }: { filters: Filters; categories: Category[]; locale: Locale; dict: Dictionary }) {
  const hasFilters = !!(filters.search || filters.category || filters.sort !== "latest");
  return (
    <form method="get" action={`/${locale}/books`} role="search" className="mt-8 grid gap-3 rounded-[var(--radius-card)] bg-surface p-3 shadow-soft ring-1 ring-line sm:grid-cols-[1fr_auto_auto] sm:items-center sm:p-4">
      <div className="relative">
        <label htmlFor="books-search" className="sr-only">
          {dict.common.search}
        </label>
        <Search className="pointer-events-none absolute start-4 top-1/2 size-5 -translate-y-1/2 text-subtle" aria-hidden />
        <Input id="books-search" name="search" type="search" defaultValue={filters.search} placeholder={dict.books.searchPlaceholder} className="ps-12" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:contents">
        <div>
          <label htmlFor="books-category" className="sr-only">
            {dict.books.categoryLabel}
          </label>
          <AutoSubmitSelect id="books-category" name="category" defaultValue={filters.category ?? ""} className="sm:w-52">
            <option value="">{dict.books.allCategories}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </AutoSubmitSelect>
        </div>
        <div>
          <label htmlFor="books-sort" className="sr-only">
            {dict.books.sortLabel}
          </label>
          <AutoSubmitSelect id="books-sort" name="sort" defaultValue={filters.sort} className="sm:w-44">
            {SORTS.map((s) => (
              <option key={s} value={s}>
                {dict.books.sort[s]}
              </option>
            ))}
          </AutoSubmitSelect>
        </div>
      </div>
      <div className="flex gap-2 sm:col-span-3 sm:justify-end">
        {hasFilters ? (
          <ButtonLink href={`/${locale}/books`} variant="ghost" size="sm" icon={<X className="size-4" aria-hidden />}>
            {dict.books.resetFilters}
          </ButtonLink>
        ) : null}
        <button type="submit" className="h-9 flex-1 rounded-full bg-ink-700 px-5 text-sm font-semibold text-white hover:bg-ink-800 sm:flex-none">
          {dict.books.applyFilters}
        </button>
      </div>
    </form>
  );
}

async function Results({ filters, categories, locale, dict }: { filters: Filters; categories: Category[]; locale: Locale; dict: Dictionary }) {
  let page;
  try {
    page = await listBooks({ ...filters, per_page: 20 });
  } catch (error) {
    return (
      <div className="mt-8">
        <LoadError error={error} dict={dict} title={dict.books.loadError} />
      </div>
    );
  }

  const activeCategory = categories.find((c) => c.slug === filters.category);
  const filtered = !!(filters.search || filters.category);

  return (
    <section className="mt-8" aria-live="polite">
      <div className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
        <span className="font-semibold text-ink-800">{format(dict.books.resultsCount, { count: formatNumber(page.total, locale) })}</span>
        {filters.search ? <span>· {format(dict.books.resultsFor, { query: filters.search })}</span> : null}
        {activeCategory ? <span>· {activeCategory.name}</span> : null}
      </div>

      {page.data.length ? (
        <>
          <BookGrid>
            {page.data.map((book, i) => (
              <BookCard key={book.id} book={book} locale={locale} dict={dict} priority={i < 4} />
            ))}
          </BookGrid>
          <Pagination
            meta={page}
            basePath={`/${locale}/books`}
            query={{ search: filters.search, category: filters.category, sort: filters.sort === "latest" ? undefined : filters.sort }}
            locale={locale}
            dict={dict}
          />
        </>
      ) : filtered ? (
        <EmptyState
          icon={<SearchX className="size-6" aria-hidden />}
          title={dict.books.noResultsTitle}
          description={dict.books.noResultsHint}
          action={
            <Link href={`/${locale}/books`} className="font-semibold text-ink-700 underline underline-offset-4">
              {dict.books.resetFilters}
            </Link>
          }
        />
      ) : (
        <EmptyState icon={<BookOpenText className="size-6" aria-hidden />} title={dict.books.emptyTitle} description={dict.books.emptyHint} />
      )}
    </section>
  );
}

function CatalogSkeleton() {
  return (
    <div className="mt-8 space-y-8" aria-hidden>
      <Skeleton className="h-20 rounded-[var(--radius-card)]" />
      <BookGridSkeleton count={10} />
    </div>
  );
}
