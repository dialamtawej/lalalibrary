import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { PackageSearch } from "lucide-react";
import { getI18n } from "@/lib/i18n/server";
import { format, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/ar";
import type { Paginated, StoreProduct } from "@/lib/api/types";
import { adminListProducts } from "@/lib/services/features";
import { examples } from "@/lib/pending/examples";
import { FeatureGate } from "@/components/pending/feature-gate";
import { BookCover } from "@/components/books/book-cover";
import { ProductEditor } from "@/components/admin/product-editor";
import { Alert } from "@/components/ui/alert";
import { Badge, EmptyState, PageHeader, Skeleton } from "@/components/ui/misc";
import { Pagination } from "@/components/ui/pagination";
import { cn, formatMoney, pageParam, param } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.adminProducts.title };
}

export default async function AdminProductsPage({ searchParams }: PageProps<"/[lang]/admin/products">) {
  const { locale, dict } = await getI18n();
  return (
    <div className="space-y-6">
      <PageHeader title={dict.adminProducts.title} />
      <Alert tone="info">{dict.adminProducts.createHint}</Alert>
      <Suspense fallback={<Skeleton className="h-80 rounded-[var(--radius-card)]" />}>
        <Products searchParams={searchParams} locale={locale} dict={dict} />
      </Suspense>
    </div>
  );
}

async function Products({ searchParams, locale, dict }: { searchParams: PageProps<"/[lang]/admin/products">["searchParams"]; locale: Locale; dict: Dictionary }) {
  const sp = await searchParams;
  const low = param(sp.low_stock) === "1";
  const page = pageParam(sp.page);
  const base = `/${locale}/admin/products`;
  return (
    <>
      <Link href={low ? base : `${base}?low_stock=1`} aria-pressed={low} className={cn("inline-flex rounded-full px-4 py-2 text-sm font-semibold ring-1 ring-inset", low ? "bg-ink-700 text-white ring-ink-700" : "ring-line-strong hover:bg-surface-2")}>
        {dict.adminProducts.lowStockOnly}
      </Link>
      <FeatureGate feature="adminProducts" dict={dict} load={() => adminListProducts({ low_stock: low ? 1 : undefined, page })} example={examples.products}>
        {(data) => <ProductTable data={data} low={low} locale={locale} dict={dict} />}
      </FeatureGate>
    </>
  );
}

function ProductTable({ data, low, locale, dict }: { data: Paginated<StoreProduct>; low: boolean; locale: Locale; dict: Dictionary }) {
  const t = dict.adminProducts;
  if (!data.data.length) return <EmptyState icon={<PackageSearch className="size-6" aria-hidden />} title={t.empty} />;
  return (
    <>
      <ul className="divide-y divide-line rounded-[var(--radius-card)] bg-surface shadow-soft ring-1 ring-line">
        {data.data.map((p) => (
          <li key={p.id} className="flex items-center gap-4 p-4">
            <BookCover title={p.book.title} src={p.book.cover_url} seed={p.book.id} className="w-12 shrink-0" sizes="48px" />
            <div className="grid min-w-0 flex-1 gap-1 sm:grid-cols-4 sm:items-center sm:gap-4">
              <span className="truncate font-semibold text-ink-900 sm:col-span-2">{p.book.title}</span>
              <span className="font-semibold">{formatMoney(p.price, p.currency, locale)}</span>
              <span className="flex flex-wrap gap-1">
                <Badge tone={p.stock === 0 ? "danger" : p.stock <= 3 ? "warning" : "success"}>
                  {t.stock}: {p.stock}
                </Badge>
                {p.status === "hidden" ? <Badge>{t.statuses.hidden}</Badge> : null}
              </span>
            </div>
            <ProductEditor product={p} />
          </li>
        ))}
      </ul>
      <Pagination meta={data} basePath={`/${locale}/admin/products`} query={{ low_stock: low ? "1" : undefined }} locale={locale} dict={dict} />
      <p className="sr-only">{format(dict.cart.items, { count: data.total })}</p>
    </>
  );
}
