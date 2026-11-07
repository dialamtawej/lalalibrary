import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { BookCopy, BookOpenText, ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";
import { getI18n } from "@/lib/i18n/server";
import { format, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/ar";
import type { Book } from "@/lib/api/types";
import { adminListBooks } from "@/lib/services/catalog";
import { deleteBookAction } from "@/actions/admin-catalog";
import { BookCover } from "@/components/books/book-cover";
import { AdminSearchBar } from "@/components/admin/search-bar";
import { ButtonLink } from "@/components/ui/button";
import { ConfirmAction } from "@/components/ui/confirm-action";
import { Alert } from "@/components/ui/alert";
import { Badge, EmptyState, PageHeader, Skeleton } from "@/components/ui/misc";
import { Pagination } from "@/components/ui/pagination";
import { LoadError } from "@/components/ui/load-error";
import { formatDate, pageParam, param } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.admin.books.title };
}

export default async function AdminBooksPage({ searchParams }: PageProps<"/[lang]/admin/books">) {
  const { locale, dict } = await getI18n();
  const t = dict.admin.books;
  return (
    <div className="space-y-6">
      <PageHeader
        title={t.title}
        actions={
          <ButtonLink href={`/${locale}/admin/books/new`} variant="accent" icon={<Plus className="size-4" aria-hidden />}>
            {t.add}
          </ButtonLink>
        }
      />
      <Suspense fallback={<TableSkeleton />}>
        <BooksTable searchParams={searchParams} locale={locale} dict={dict} />
      </Suspense>
    </div>
  );
}

async function BooksTable({ searchParams, locale, dict }: { searchParams: PageProps<"/[lang]/admin/books">["searchParams"]; locale: Locale; dict: Dictionary }) {
  const sp = await searchParams;
  const search = param(sp.search)?.trim() || undefined;
  const page = pageParam(sp.page);
  const created = param(sp.created) === "1";
  const t = dict.admin.books;

  let result;
  try {
    result = await adminListBooks({ search, page, per_page: 15 });
  } catch (error) {
    return <LoadError error={error} dict={dict} title={dict.books.loadError} />;
  }

  return (
    <>
      {created ? <Alert tone="success">{t.created}</Alert> : null}
      <AdminSearchBar action={`/${locale}/admin/books`} defaultValue={search} placeholder={t.searchPlaceholder} label={dict.common.search} submitLabel={dict.common.search} />

      {result.data.length === 0 ? (
        <EmptyState icon={<BookCopy className="size-6" aria-hidden />} title={search ? dict.books.noResultsTitle : t.empty} />
      ) : (
        <div className="overflow-hidden rounded-[var(--radius-card)] bg-surface shadow-soft ring-1 ring-line">
          {/* جدول للشاشات المتوسطة فأكبر */}
          <table className="hidden w-full text-start text-sm md:table">
            <thead className="bg-surface-2 text-xs font-bold uppercase tracking-wide text-muted">
              <tr>
                <th scope="col" className="px-5 py-3 text-start">{t.columns.book}</th>
                <th scope="col" className="px-5 py-3 text-start">{t.columns.categories}</th>
                <th scope="col" className="px-5 py-3 text-start">{t.columns.ebook}</th>
                <th scope="col" className="px-5 py-3 text-start">{t.columns.added}</th>
                <th scope="col" className="px-5 py-3 text-end">
                  <span className="sr-only">{dict.common.actions}</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {result.data.map((book) => (
                <tr key={book.id} className="hover:bg-paper/60">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <BookCover title={book.title} src={book.cover_url} seed={book.id} className="w-10 shrink-0" sizes="40px" />
                      <span className="line-clamp-2 font-semibold text-ink-900">{book.title}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <CategoryBadges book={book} />
                  </td>
                  <td className="px-5 py-3">{book.has_ebook ? <Badge tone="saffron" icon={<BookOpenText className="size-3.5" aria-hidden />}>PDF</Badge> : <span className="text-subtle">—</span>}</td>
                  <td className="whitespace-nowrap px-5 py-3 text-muted">{formatDate(book.created_at, locale) ?? "—"}</td>
                  <td className="px-5 py-3">
                    <RowActions book={book} locale={locale} dict={dict} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* بطاقات للموبايل (بدون تمرير أفقي) */}
          <ul className="divide-y divide-line md:hidden">
            {result.data.map((book) => (
              <li key={book.id} className="flex gap-4 p-4">
                <BookCover title={book.title} src={book.cover_url} seed={book.id} className="w-16 shrink-0" sizes="64px" />
                <div className="min-w-0 flex-1 space-y-2">
                  <p className="font-semibold text-ink-900">{book.title}</p>
                  <CategoryBadges book={book} />
                  <p className="text-xs text-muted">{formatDate(book.created_at, locale)}</p>
                  <RowActions book={book} locale={locale} dict={dict} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Pagination meta={result} basePath={`/${locale}/admin/books`} query={{ search }} locale={locale} dict={dict} />
    </>
  );
}

function CategoryBadges({ book }: { book: Book }) {
  return (
    <div className="flex flex-wrap gap-1">
      {book.categories.map((c) => (
        <Badge key={c.id} tone="plum">
          {c.name}
        </Badge>
      ))}
    </div>
  );
}

function RowActions({ book, locale, dict }: { book: Book; locale: Locale; dict: Dictionary }) {
  const t = dict.admin.books;
  return (
    <div className="flex flex-wrap items-center justify-start gap-1.5 md:justify-end">
      <Link href={`/${locale}/books/${book.slug}`} target="_blank" className="grid size-9 place-items-center rounded-full text-muted hover:bg-surface-2 hover:text-ink-800" aria-label={`${t.viewOnSite}: ${book.title}`} title={t.viewOnSite}>
        <ExternalLink className="size-4" aria-hidden />
      </Link>
      <ButtonLink href={`/${locale}/admin/books/${book.slug}/edit`} variant="secondary" size="sm" icon={<Pencil className="size-3.5" aria-hidden />}>
        {dict.common.edit}
      </ButtonLink>
      <ConfirmAction
        action={deleteBookAction.bind(null, book.id)}
        title={t.deleteTitle}
        description={format(t.deleteBody, { title: book.title })}
        confirmLabel={dict.common.delete}
        trigger={<span className="sr-only">{`${dict.common.delete}: ${book.title}`}</span>}
        triggerIcon={<Trash2 className="size-4" aria-hidden />}
        triggerSize="icon"
      />
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-4" aria-hidden>
      <Skeleton className="h-12 rounded-full" />
      <Skeleton className="h-96 rounded-[var(--radius-card)]" />
    </div>
  );
}
