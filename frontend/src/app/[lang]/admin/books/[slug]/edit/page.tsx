import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExternalLink, Trash2 } from "lucide-react";
import { getI18n } from "@/lib/i18n/server";
import { format, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/ar";
import type { Book, Category } from "@/lib/api/types";
import { isApiError } from "@/lib/api/errors";
import { adminListCategories, getBook } from "@/lib/services/catalog";
import { deleteBookAction, updateBookAction } from "@/actions/admin-catalog";
import { BookForm } from "@/components/admin/book-form";
import { ButtonLink } from "@/components/ui/button";
import { ConfirmAction } from "@/components/ui/confirm-action";
import { Card, CardTitle, PageHeader, Skeleton } from "@/components/ui/misc";
import { LoadError } from "@/components/ui/load-error";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.admin.books.editTitle };
}

export default async function EditBookPage({ params }: PageProps<"/[lang]/admin/books/[slug]/edit">) {
  const { locale, dict } = await getI18n();
  return (
    <Suspense fallback={<Skeleton className="h-[36rem] rounded-[var(--radius-card)]" />}>
      <EditBook params={params} locale={locale} dict={dict} />
    </Suspense>
  );
}

async function EditBook({ params, locale, dict }: { params: PageProps<"/[lang]/admin/books/[slug]/edit">["params"]; locale: Locale; dict: Dictionary }) {
  const { slug } = await params;
  const t = dict.admin.books;

  let book: Book;
  let categories: Category[];
  try {
    [book, categories] = await Promise.all([getBook(slug), adminListCategories()]);
  } catch (error) {
    if (isApiError(error) && error.isNotFound) notFound();
    return <LoadError error={error} dict={dict} title={dict.books.loadError} />;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={t.editTitle}
        title={book.title}
        actions={
          <ButtonLink href={`/${locale}/books/${book.slug}`} target="_blank" variant="secondary" size="sm" icon={<ExternalLink className="size-4" aria-hidden />}>
            {t.viewOnSite}
          </ButtonLink>
        }
      />
      <BookForm action={updateBookAction.bind(null, book.id)} categories={categories} book={book} />

      <Card className="ring-danger/30">
        <CardTitle description={format(t.deleteBody, { title: book.title })}>{dict.admin.users.dangerSection}</CardTitle>
        <ConfirmAction
          action={deleteBookAction.bind(null, book.id)}
          title={t.deleteTitle}
          description={format(t.deleteBody, { title: book.title })}
          confirmLabel={dict.common.delete}
          trigger={dict.common.delete}
          triggerIcon={<Trash2 className="size-4" aria-hidden />}
          triggerSize="md"
          hiddenFields={{ redirect_to: "list" }}
        />
      </Card>
    </div>
  );
}
