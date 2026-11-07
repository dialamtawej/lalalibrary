import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getI18n } from "@/lib/i18n/server";
import { localeMeta, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/ar";
import { isApiError } from "@/lib/api/errors";
import { adminGetOrder } from "@/lib/services/features";
import { examples } from "@/lib/pending/examples";
import { FeatureGate } from "@/components/pending/feature-gate";
import { OrderStatusForm } from "@/components/admin/order-status-form";
import { OrderDetails } from "@/components/store/order-views";
import { Card, CardTitle, Skeleton } from "@/components/ui/misc";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.adminOrders.title };
}

export default async function AdminOrderPage({ params }: PageProps<"/[lang]/admin/orders/[id]">) {
  const { locale, dict } = await getI18n();
  const Back = localeMeta[locale].dir === "rtl" ? ArrowRight : ArrowLeft;
  return (
    <div className="space-y-6">
      <Link href={`/${locale}/admin/orders`} className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-ink-800">
        <Back className="size-4" aria-hidden />
        {dict.adminOrders.title}
      </Link>
      <Suspense fallback={<Skeleton className="h-96 rounded-[var(--radius-card)]" />}>
        <OrderContent params={params} locale={locale} dict={dict} />
      </Suspense>
    </div>
  );
}

async function OrderContent({ params, locale, dict }: { params: PageProps<"/[lang]/admin/orders/[id]">["params"]; locale: Locale; dict: Dictionary }) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();
  return (
    <FeatureGate
      feature="adminOrders"
      dict={dict}
      example={examples.order}
      load={async () => {
        try {
          return await adminGetOrder(id);
        } catch (error) {
          if (isApiError(error) && error.isNotFound && !error.isMissingRoute) notFound();
          throw error;
        }
      }}
    >
      {(order) => (
        <OrderDetails
          order={order}
          locale={locale}
          dict={dict}
          actions={
            <>
              {order.user ? (
                <Card>
                  <CardTitle>{dict.orders.customer}</CardTitle>
                  <p className="font-semibold text-ink-900">{order.user.name}</p>
                  {order.user.email ? (
                    <p className="text-sm text-muted">
                      <span dir="ltr">{order.user.email}</span>
                    </p>
                  ) : null}
                  <Link href={`/${locale}/admin/users/${order.user.id}`} className="mt-2 inline-block text-sm font-semibold text-ink-700 hover:underline">
                    {dict.admin.users.details}
                  </Link>
                </Card>
              ) : null}
              <OrderStatusForm orderId={order.id} status={order.status} />
            </>
          }
        />
      )}
    </FeatureGate>
  );
}
