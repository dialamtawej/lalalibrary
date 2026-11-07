import { Suspense } from "react";
import type { Metadata } from "next";
import { getI18n } from "@/lib/i18n/server";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/ar";
import type { OrderStatus } from "@/lib/api/types";
import { adminListOrders } from "@/lib/services/features";
import { examples } from "@/lib/pending/examples";
import { FeatureGate } from "@/components/pending/feature-gate";
import { AdminSearchBar } from "@/components/admin/search-bar";
import { AutoSubmitSelect } from "@/components/books/auto-submit-select";
import { OrderList } from "@/components/store/order-list";
import { PageHeader, Skeleton } from "@/components/ui/misc";
import { pageParam, param } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.adminOrders.title };
}

const STATUSES: OrderStatus[] = ["pending", "confirmed", "preparing", "shipped", "delivered", "cancelled"];

export default async function AdminOrdersPage({ searchParams }: PageProps<"/[lang]/admin/orders">) {
  const { locale, dict } = await getI18n();
  return (
    <div className="space-y-6">
      <PageHeader title={dict.adminOrders.title} />
      <Suspense fallback={<Skeleton className="h-80 rounded-[var(--radius-card)]" />}>
        <Orders searchParams={searchParams} locale={locale} dict={dict} />
      </Suspense>
    </div>
  );
}

async function Orders({ searchParams, locale, dict }: { searchParams: PageProps<"/[lang]/admin/orders">["searchParams"]; locale: Locale; dict: Dictionary }) {
  const sp = await searchParams;
  const search = param(sp.search)?.trim() || undefined;
  const raw = param(sp.status) as OrderStatus | undefined;
  const status = raw && STATUSES.includes(raw) ? raw : undefined;
  const page = pageParam(sp.page);
  const t = dict.adminOrders;

  return (
    <>
      <AdminSearchBar action={`/${locale}/admin/orders`} defaultValue={search} placeholder={t.searchPlaceholder} label={dict.common.search} submitLabel={dict.common.search}>
        <div className="sm:w-48">
          <label htmlFor="order-status" className="sr-only">
            {dict.orders.status.pending}
          </label>
          <AutoSubmitSelect id="order-status" name="status" defaultValue={status ?? ""}>
            <option value="">{t.allStatuses}</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {dict.orders.status[s]}
              </option>
            ))}
          </AutoSubmitSelect>
        </div>
      </AdminSearchBar>
      <FeatureGate feature="adminOrders" dict={dict} load={() => adminListOrders({ status, search, page })} example={examples.orders}>
        {(data) => <OrderList data={data} locale={locale} dict={dict} basePath={`/${locale}/admin/orders`} showCustomer />}
      </FeatureGate>
    </>
  );
}
