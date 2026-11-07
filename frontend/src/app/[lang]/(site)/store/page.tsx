import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { PackageSearch, Search, Truck } from "lucide-react";
import { getI18n } from "@/lib/i18n/server";
import { format, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/ar";
import type { Paginated, StoreProduct, User } from "@/lib/api/types";
import { getCurrentUser } from "@/lib/auth/dal";
import { listProducts } from "@/lib/services/features";
import { examples } from "@/lib/pending/examples";
import { apiPreviewEnabled, getCapabilities } from "@/lib/pending/capabilities";
import { FeatureGate } from "@/components/pending/feature-gate";
import { BookCover } from "@/components/books/book-cover";
import { AddToCart } from "@/components/store/add-to-cart";
import { ButtonLink } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { Badge, EmptyState, PageHeader, Skeleton } from "@/components/ui/misc";
import { Pagination } from "@/components/ui/pagination";
import { formatMoney, pageParam, param } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.store.title, description: dict.store.subtitle };
}

export default async function StorePage({ searchParams }: PageProps<"/[lang]/store">) {
  const { locale, dict } = await getI18n();
  return (
    <div className="container-page py-10 sm:py-14">
      <PageHeader
        eyebrow={
          <span className="inline-flex items-center gap-2">
            <Truck className="size-4" aria-hidden />
            {dict.checkout.cod}
          </span>
        }
        title={dict.store.title}
        description={dict.store.subtitle}
      />
      <Suspense fallback={<Skeleton className="mt-8 h-96 rounded-[var(--radius-card)]" />}>
        <StoreContent searchParams={searchParams} locale={locale} dict={dict} />
      </Suspense>
    </div>
  );
}

async function StoreContent({ searchParams, locale, dict }: { searchParams: PageProps<"/[lang]/store">["searchParams"]; locale: Locale; dict: Dictionary }) {
  const sp = await searchParams;
  const search = param(sp.search)?.trim() || undefined;
  const inStock = param(sp.in_stock) === "1";
  const page = pageParam(sp.page);
  const showFilters = (await getCapabilities()).store || apiPreviewEnabled();
  const user = await getCurrentUser().catch(() => null);

  return (
    <>
      {/* البحث يظهر فقط عندما تكون الخدمة متاحة (أو في وضع المعاينة) */}
      {showFilters ? (
        <>
      <form method="get" action={`/${locale}/store`} role="search" className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <label htmlFor="store-search" className="sr-only">
            {dict.common.search}
          </label>
          <Search className="pointer-events-none absolute start-4 top-1/2 size-5 -translate-y-1/2 text-subtle" aria-hidden />
          <Input id="store-search" name="search" type="search" defaultValue={search} placeholder={dict.store.searchPlaceholder} className="ps-12" />
        </div>
        <label className="inline-flex h-12 cursor-pointer items-center gap-2 rounded-full bg-surface px-4 font-semibold ring-1 ring-line-strong">
          <input type="checkbox" name="in_stock" value="1" defaultChecked={inStock} className="size-4 accent-ink-700" />
          {dict.store.onlyInStock}
        </label>
        <button type="submit" className="h-12 rounded-full bg-ink-700 px-6 font-semibold text-white hover:bg-ink-800">
          {dict.common.search}
        </button>
      </form>
        </>
      ) : null}
      <div className="mt-8">
        <FeatureGate feature="store" dict={dict} load={() => listProducts({ search, in_stock: inStock ? 1 : undefined, page, per_page: 20 })} example={examples.products}>
          {(data) => <ProductGrid data={data} user={user} query={{ search, in_stock: inStock ? "1" : undefined }} locale={locale} dict={dict} />}
        </FeatureGate>
      </div>
    </>
  );
}

function ProductGrid({ data, user, query, locale, dict }: { data: Paginated<StoreProduct>; user: User | null; query: Record<string, string | undefined>; locale: Locale; dict: Dictionary }) {
  if (!data.data.length) return <EmptyState icon={<PackageSearch className="size-6" aria-hidden />} title={dict.store.empty} />;
  return (
    <>
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {data.data.map((p) => (
          <li key={p.id} className="flex gap-4 rounded-[var(--radius-card)] bg-surface p-4 shadow-soft ring-1 ring-line">
            <Link href={`/${locale}/books/${p.book.slug}`} className="w-24 shrink-0">
              <BookCover title={p.book.title} src={p.book.cover_url} seed={p.book.id} sizes="96px" />
            </Link>
            <div className="flex min-w-0 flex-1 flex-col">
              <Link href={`/${locale}/books/${p.book.slug}`} className="line-clamp-2 font-semibold text-ink-900 hover:underline">
                {p.book.title}
              </Link>
              {p.book.authors?.length ? <p className="mt-0.5 truncate text-sm text-muted">{p.book.authors.map((a) => a.name).join("، ")}</p> : null}
              <p className="mt-2 font-display text-2xl font-bold text-ink-900">{formatMoney(p.price, p.currency, locale)}</p>
              <div className="mt-1">
                {p.in_stock ? (
                  <Badge tone={p.stock <= 3 ? "warning" : "success"}>{p.stock <= 3 ? format(dict.store.lowStock, { count: p.stock }) : dict.store.inStock}</Badge>
                ) : (
                  <Badge tone="danger">{dict.store.outOfStock}</Badge>
                )}
              </div>
              <div className="mt-auto pt-3">
                {!p.in_stock ? null : user ? (
                  <AddToCart productId={p.id} maxQuantity={p.stock} compact />
                ) : (
                  <ButtonLink href={`/${locale}/login?next=${encodeURIComponent("/store")}`} variant="secondary" size="sm">
                    {dict.store.loginToBuy}
                  </ButtonLink>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
      <Pagination meta={data} basePath={`/${locale}/store`} query={query} locale={locale} dict={dict} />
    </>
  );
}
