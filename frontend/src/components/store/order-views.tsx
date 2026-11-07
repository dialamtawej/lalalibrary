import type { ReactNode } from "react";
import Link from "next/link";
import { Check, CircleX } from "lucide-react";
import type { Order, OrderStatus } from "@/lib/api/types";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/ar";
import { Badge, Card, CardTitle } from "@/components/ui/misc";
import { cn, formatDate, formatMoney } from "@/lib/utils";

const statusTone: Record<OrderStatus, "neutral" | "ink" | "saffron" | "plum" | "success" | "danger" | "warning"> = {
  pending: "warning",
  confirmed: "ink",
  preparing: "plum",
  shipped: "saffron",
  delivered: "success",
  cancelled: "danger",
};

export const ORDER_FLOW: OrderStatus[] = ["pending", "confirmed", "preparing", "shipped", "delivered"];

export function OrderStatusBadge({ status, dict }: { status: OrderStatus; dict: Dictionary }) {
  return <Badge tone={statusTone[status]}>{dict.orders.status[status]}</Badge>;
}

/** خط زمني لحالة الطلب: المراحل المكتملة من history القادمة من الباك إند */
export function OrderTimeline({ order, locale, dict }: { order: Order; locale: Locale; dict: Dictionary }) {
  if (order.status === "cancelled") {
    return (
      <p className="inline-flex items-center gap-2 rounded-2xl bg-danger-soft px-4 py-3 text-sm font-semibold text-danger">
        <CircleX className="size-5" aria-hidden />
        {dict.orders.status.cancelled}
      </p>
    );
  }
  const reached = new Map(order.history.map((h) => [h.status, h.at]));
  const currentIndex = ORDER_FLOW.indexOf(order.status);
  return (
    <ol className="grid gap-3 sm:grid-cols-5">
      {ORDER_FLOW.map((s, i) => {
        const done = i <= currentIndex;
        return (
          <li key={s} className="flex items-center gap-3 sm:flex-col sm:items-start" aria-current={i === currentIndex ? "step" : undefined}>
            <span className={cn("grid size-9 shrink-0 place-items-center rounded-full text-sm font-bold", done ? "bg-saffron-400 text-ink-900" : "bg-surface-2 text-subtle")}>
              {done ? <Check className="size-4" aria-hidden /> : i + 1}
            </span>
            <span>
              <span className={cn("block text-sm font-semibold", done ? "text-ink-900" : "text-subtle")}>{dict.orders.status[s]}</span>
              {reached.get(s) ? <span className="block text-xs text-muted">{formatDate(reached.get(s), locale)}</span> : null}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/** تفاصيل الطلب: مشتركة بين صفحة المستخدم وصفحة الأدمن */
export function OrderDetails({ order, locale, dict, actions }: { order: Order; locale: Locale; dict: Dictionary; actions?: ReactNode }) {
  const t = dict.orders;
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted">{t.number}</p>
          <h1 className="font-display text-3xl font-bold text-ink-900" dir="ltr">
            {order.number}
          </h1>
          <p className="mt-1 text-sm text-muted">{formatDate(order.created_at, locale)}</p>
        </div>
        <OrderStatusBadge status={order.status} dict={dict} />
      </header>

      <Card>
        <CardTitle>{t.tracking}</CardTitle>
        <OrderTimeline order={order} locale={locale} dict={dict} />
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <Card>
          <CardTitle>{t.items}</CardTitle>
          <ul className="divide-y divide-line">
            {order.items.map((item, i) => (
              <li key={i} className="flex items-center justify-between gap-4 py-3">
                <span className="min-w-0">
                  {item.book_slug ? (
                    <Link href={`/${locale}/books/${item.book_slug}`} className="font-semibold text-ink-900 hover:underline">
                      {item.title}
                    </Link>
                  ) : (
                    <span className="font-semibold text-ink-900">{item.title}</span>
                  )}
                  <span className="block text-sm text-muted">
                    {formatMoney(item.unit_price, order.currency, locale)} × {item.quantity}
                  </span>
                </span>
                <span className="font-semibold">{formatMoney(item.line_total, order.currency, locale)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-1 border-t border-line pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">{dict.cart.subtotal}</dt>
              <dd>{formatMoney(order.subtotal, order.currency, locale)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">{dict.cart.shipping}</dt>
              <dd>{formatMoney(order.shipping, order.currency, locale)}</dd>
            </div>
            <div className="flex justify-between text-base font-bold text-ink-900">
              <dt>{dict.cart.total}</dt>
              <dd>{formatMoney(order.total, order.currency, locale)}</dd>
            </div>
          </dl>
        </Card>
        <div className="space-y-6">
          <Card>
            <CardTitle>{t.address}</CardTitle>
            <address className="space-y-1 text-sm not-italic leading-relaxed">
              <p className="font-semibold text-ink-900">{order.shipping_address.name}</p>
              <p dir="ltr" className="text-start">
                {order.shipping_address.phone}
              </p>
              <p>
                {order.shipping_address.city} — {order.shipping_address.address}
              </p>
              {order.shipping_address.notes ? <p className="text-muted">{order.shipping_address.notes}</p> : null}
            </address>
            <p className="mt-4 text-sm">
              <span className="text-muted">{t.payment}: </span>
              <span className="font-semibold">{dict.checkout.cod}</span>
            </p>
          </Card>
          {actions}
        </div>
      </div>
    </div>
  );
}
