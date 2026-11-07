import type { ReactNode } from "react";
import type { Cart } from "@/lib/api/types";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/ar";
import { formatMoney } from "@/lib/utils";

/** ملخص الأسعار كما يحسبها الباك إند (الواجهة لا تحسب أي سعر) */
export function CartSummary({ cart, locale, dict, children }: { cart: Cart; locale: Locale; dict: Dictionary; children?: ReactNode }) {
  const row = "flex items-center justify-between py-2";
  return (
    <div className="rounded-[var(--radius-card)] bg-surface p-6 shadow-soft ring-1 ring-line">
      <h2 className="mb-3 text-lg font-bold text-ink-900">{dict.cart.summary}</h2>
      <dl className="divide-y divide-line text-sm">
        <div className={row}>
          <dt className="text-muted">{dict.cart.subtotal}</dt>
          <dd className="font-semibold">{formatMoney(cart.subtotal, cart.currency, locale)}</dd>
        </div>
        <div className={row}>
          <dt className="text-muted">{dict.cart.shipping}</dt>
          <dd className="font-semibold">{formatMoney(cart.shipping, cart.currency, locale)}</dd>
        </div>
        <div className={`${row} text-base`}>
          <dt className="font-bold text-ink-900">{dict.cart.total}</dt>
          <dd className="font-display text-2xl font-bold text-ink-900">{formatMoney(cart.total, cart.currency, locale)}</dd>
        </div>
      </dl>
      {children ? <div className="mt-5">{children}</div> : null}
    </div>
  );
}
