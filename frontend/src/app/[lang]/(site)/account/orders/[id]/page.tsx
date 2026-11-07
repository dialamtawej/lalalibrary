import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getI18n } from "@/lib/i18n/server";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/ar";
import { isApiError } from "@/lib/api/errors";
import { requireUser } from "@/lib/auth/dal";
import { getOrder } from "@/lib/services/features";
import { examples } from "@/lib/pending/examples";
import { cancelOrderAction } from "@/actions/features";
import { FeatureGate } from "@/components/pending/feature-gate";
import { OrderDetails } from "@/components/store/order-views";
import { Alert } from "@/components/ui/alert";
import { ConfirmAction } from "@/components/ui/confirm-action";
import { Skeleton } from "@/components/ui/misc";
import { param } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.orders.title, robots: { index: false } };
}

export default async function OrderPage({ params, searchParams }: PageProps<"/[lang]/account/orders/[id]">) {
  const { locale, dict } = await getI18n();
  return (
    <Suspense fallback={<Skeleton className="h-96 rounded-[var(--radius-card)]" />}>
      <OrderContent params={params} searchParams={searchParams} locale={locale} dict={dict} />
    </Suspense>
  );
}

async function OrderContent({
  params,
  searchParams,
  locale,
  dict,
}: {
  params: PageProps<"/[lang]/account/orders/[id]">["params"];
  searchParams: PageProps<"/[lang]/account/orders/[id]">["searchParams"];
  locale: Locale;
  dict: Dictionary;
}) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  await requireUser(locale, `/account/orders/${id}`);
  if (!/^\d+$/.test(id)) notFound();
  const placed = param(sp.placed) === "1";

  return (
    <FeatureGate
      feature="orders"
      dict={dict}
      example={examples.order}
      load={async () => {
        try {
          return await getOrder(id);
        } catch (error) {
          if (isApiError(error) && (error.isNotFound || error.isForbidden) && !error.isMissingRoute) notFound();
          throw error;
        }
      }}
    >
      {(order) => (
        <div className="space-y-6">
          {placed ? <Alert tone="success">{dict.orders.placed}</Alert> : null}
          <OrderDetails
            order={order}
            locale={locale}
            dict={dict}
            actions={
              order.status === "pending" ? (
                <ConfirmAction
                  action={cancelOrderAction.bind(null, order.id)}
                  title={dict.orders.cancelTitle}
                  description={dict.orders.cancelBody}
                  confirmLabel={dict.orders.cancel}
                  trigger={dict.orders.cancel}
                  triggerSize="md"
                />
              ) : null
            }
          />
        </div>
      )}
    </FeatureGate>
  );
}
