import { Suspense } from "react";
import type { Metadata } from "next";
import { getI18n } from "@/lib/i18n/server";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/ar";
import { requireUser } from "@/lib/auth/dal";
import { listOrders } from "@/lib/services/features";
import { examples } from "@/lib/pending/examples";
import { FeatureGate } from "@/components/pending/feature-gate";
import { OrderList } from "@/components/store/order-list";
import { PageHeader, Skeleton } from "@/components/ui/misc";
import { pageParam } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.orders.title, robots: { index: false } };
}

export default async function OrdersPage({ searchParams }: PageProps<"/[lang]/account/orders">) {
  const { locale, dict } = await getI18n();
  return (
    <>
      <PageHeader title={dict.orders.title} description={dict.orders.subtitle} />
      <div className="mt-8">
        <Suspense fallback={<Skeleton className="h-72 rounded-[var(--radius-card)]" />}>
          <Orders searchParams={searchParams} locale={locale} dict={dict} />
        </Suspense>
      </div>
    </>
  );
}

async function Orders({ searchParams, locale, dict }: { searchParams: PageProps<"/[lang]/account/orders">["searchParams"]; locale: Locale; dict: Dictionary }) {
  await requireUser(locale, "/account/orders");
  const page = pageParam((await searchParams).page);
  return (
    <FeatureGate feature="orders" dict={dict} load={() => listOrders(page)} example={examples.orders}>
      {(data) => <OrderList data={data} locale={locale} dict={dict} />}
    </FeatureGate>
  );
}
