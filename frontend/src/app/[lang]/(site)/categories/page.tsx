import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Shapes } from "lucide-react";
import { getI18n } from "@/lib/i18n/server";
import { format, localeMeta, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/ar";
import { getCategories } from "@/lib/services/catalog";
import { EmptyState, PageHeader, Skeleton } from "@/components/ui/misc";
import { LoadError } from "@/components/ui/load-error";
import { cn, formatNumber } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.categories.title, description: dict.categories.subtitle };
}

export default async function CategoriesPage() {
  const { locale, dict } = await getI18n();
  return (
    <div className="container-page py-10 sm:py-14">
      <PageHeader title={dict.categories.title} description={dict.categories.subtitle} />
      <Suspense fallback={<GridSkeleton />}>
        <CategoryGrid locale={locale} dict={dict} />
      </Suspense>
    </div>
  );
}

const cardTones = [
  "bg-saffron-100 text-ink-900",
  "bg-plum-50 text-plum-700",
  "bg-ink-50 text-ink-800",
  "bg-[#eef3ea] text-[#2f4a3a]",
];

async function CategoryGrid({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  let categories;
  try {
    categories = await getCategories();
  } catch (error) {
    return (
      <div className="mt-8">
        <LoadError error={error} dict={dict} title={dict.categories.loadError} />
      </div>
    );
  }
  if (!categories.length) {
    return <EmptyState className="mt-8" icon={<Shapes className="size-6" aria-hidden />} title={dict.categories.empty} />;
  }
  const Arrow = localeMeta[locale].dir === "rtl" ? ArrowLeft : ArrowRight;

  return (
    <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((category, i) => (
        <li key={category.id}>
          <Link
            href={`/${locale}/books?category=${encodeURIComponent(category.slug)}`}
            className={cn("group flex h-full flex-col rounded-[var(--radius-card)] p-6 transition-transform hover:-translate-y-1", cardTones[i % cardTones.length])}
          >
            <span className="font-display text-2xl font-bold">{category.name}</span>
            {category.description ? <span className="mt-2 line-clamp-2 text-sm opacity-80">{category.description}</span> : null}
            <span className="mt-auto flex items-center justify-between pt-6 text-sm font-semibold">
              {typeof category.books_count === "number" ? format(dict.categories.booksCount, { count: formatNumber(category.books_count, locale) }) : null}
              <Arrow className="size-5 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" aria-hidden />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function GridSkeleton() {
  return (
    <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-hidden>
      {Array.from({ length: 6 }, (_, i) => (
        <Skeleton key={i} className="h-40 rounded-[var(--radius-card)]" />
      ))}
    </div>
  );
}
