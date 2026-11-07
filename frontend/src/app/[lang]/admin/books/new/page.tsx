import { Suspense } from "react";
import type { Metadata } from "next";
import { getI18n } from "@/lib/i18n/server";
import type { Dictionary } from "@/lib/i18n/dictionaries/ar";
import type { Category } from "@/lib/api/types";
import { adminListCategories } from "@/lib/services/catalog";
import { createBookAction } from "@/actions/admin-catalog";
import { BookForm } from "@/components/admin/book-form";
import { PageHeader, Skeleton } from "@/components/ui/misc";
import { LoadError } from "@/components/ui/load-error";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.admin.books.newTitle };
}

export default async function NewBookPage() {
  const { dict } = await getI18n();
  return (
    <div className="space-y-8">
      <PageHeader eyebrow={dict.admin.books.title} title={dict.admin.books.newTitle} />
      <Suspense fallback={<Skeleton className="h-[32rem] rounded-[var(--radius-card)]" />}>
        <NewBookForm dict={dict} />
      </Suspense>
    </div>
  );
}

async function NewBookForm({ dict }: { dict: Dictionary }) {
  let categories: Category[];
  try {
    categories = await adminListCategories();
  } catch (error) {
    return <LoadError error={error} dict={dict} title={dict.categories.loadError} />;
  }
  return <BookForm action={createBookAction} categories={categories} />;
}
