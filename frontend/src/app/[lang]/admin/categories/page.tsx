import { Suspense } from "react";
import type { Metadata } from "next";
import { getI18n } from "@/lib/i18n/server";
import type { Dictionary } from "@/lib/i18n/dictionaries/ar";
import type { Category } from "@/lib/api/types";
import { adminListCategories } from "@/lib/services/catalog";
import { CategoryManager } from "@/components/admin/category-manager";
import { PageHeader, Skeleton } from "@/components/ui/misc";
import { LoadError } from "@/components/ui/load-error";
import { param } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.admin.categories.title };
}

export default async function AdminCategoriesPage({ searchParams }: PageProps<"/[lang]/admin/categories">) {
  const { dict } = await getI18n();
  return (
    <Suspense fallback={<Skeleton className="h-96 rounded-[var(--radius-card)]" />}>
      <Categories searchParams={searchParams} dict={dict} />
    </Suspense>
  );
}

async function Categories({ searchParams, dict }: { searchParams: PageProps<"/[lang]/admin/categories">["searchParams"]; dict: Dictionary }) {
  const sp = await searchParams;
  let categories: Category[];
  try {
    categories = await adminListCategories();
  } catch (error) {
    return (
      <div className="space-y-6">
        <PageHeader title={dict.admin.categories.title} />
        <LoadError error={error} dict={dict} title={dict.categories.loadError} />
      </div>
    );
  }
  return <CategoryManager categories={categories} startCreating={param(sp.new) === "1"} />;
}
