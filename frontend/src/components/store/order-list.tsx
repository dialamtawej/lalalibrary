import Link from "next/link";
import { ChevronLeft, ChevronRight, Package } from "lucide-react";
import { format, localeMeta, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/ar";
import type { Order, Paginated } from "@/lib/api/types";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/misc";
import { Pagination } from "@/components/ui/pagination";
import { formatDate, formatMoney } from "@/lib/utils";
import { OrderStatusBadge } from "./order-views";

/** قائمة طلبات: مشتركة بين "طلباتي" وصفحة الأدمن */
export function OrderList({ data, locale, dict, basePath = `/${locale}/account/orders`, showCustomer }: { data: Paginated<Order>; locale: Locale; dict: Dictionary; basePath?: string; showCustomer?: boolean }) {
  if (!data.data.length) {
    return <EmptyState icon={<Package className="size-6" aria-hidden />} title={dict.orders.empty} action={showCustomer ? undefined : <ButtonLink href={`/${locale}/store`}>{dict.cart.browseStore}</ButtonLink>} />;
  }
  const Chevron = localeMeta[locale].dir === "rtl" ? ChevronLeft : ChevronRight;
  return (
    <>
      <ul className="divide-y divide-line overflow-hidden rounded-[var(--radius-card)] bg-surface shadow-soft ring-1 ring-line">
        {data.data.map((order) => (
          <li key={order.id}>
            <Link href={`${basePath}/${order.id}`} className="flex items-center gap-4 p-4 hover:bg-paper/60 sm:p-5">
              <div className="grid min-w-0 flex-1 gap-1 sm:grid-cols-4 sm:items-center sm:gap-4">
                <span className="font-semibold text-ink-900" dir="ltr">
                  {order.number}
                </span>
                <span className="text-sm text-muted">{showCustomer && order.user ? order.user.name : formatDate(order.created_at, locale)}</span>
                <span className="text-sm text-muted">
                  {format(dict.orders.itemsCount, { count: order.items.reduce((n, i) => n + i.quantity, 0) })} · <span className="font-semibold text-ink-800">{formatMoney(order.total, order.currency, locale)}</span>
                </span>
                <span>
                  <OrderStatusBadge status={order.status} dict={dict} />
                </span>
              </div>
              <Chevron className="size-5 shrink-0 text-subtle" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
      <Pagination meta={data} basePath={basePath} query={{}} locale={locale} dict={dict} />
    </>
  );
}
