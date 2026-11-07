import { Suspense } from "react";
import type { Metadata } from "next";
import { ShoppingBag } from "lucide-react";
import { getI18n } from "@/lib/i18n/server";
import { format, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/ar";
import type { Cart, User } from "@/lib/api/types";
import { requireUser } from "@/lib/auth/dal";
import { getCart } from "@/lib/services/features";
import { examples } from "@/lib/pending/examples";
import { assertAvailable } from "@/lib/pending/capabilities";
import { FeatureGate } from "@/components/pending/feature-gate";
import { CartSummary } from "@/components/store/cart-summary";
import { CheckoutForm } from "@/components/store/checkout-form";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState, PageHeader, Skeleton } from "@/components/ui/misc";
import { formatMoney } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.checkout.title, robots: { index: false } };
}

export default async function CheckoutPage() {
  const { locale, dict } = await getI18n();
  return (
    <div className="container-page max-w-6xl py-10 sm:py-14">
      <PageHeader title={dict.checkout.title} description={dict.checkout.subtitle} />
      <div className="mt-8">
        <Suspense fallback={<Skeleton className="h-96 rounded-[var(--radius-card)]" />}>
          <CheckoutContent locale={locale} dict={dict} />
        </Suspense>
      </div>
    </div>
  );
}

async function CheckoutContent({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const user = await requireUser(locale, "/checkout");
  return (
    <FeatureGate feature="orders" dict={dict} load={async () => {
      await assertAvailable("orders");
      return getCart();
    }} example={examples.cart}>
      {(cart) => <CheckoutView cart={cart} user={user} locale={locale} dict={dict} />}
    </FeatureGate>
  );
}

function CheckoutView({ cart, user, locale, dict }: { cart: Cart; user: User; locale: Locale; dict: Dictionary }) {
  if (!cart.items.length) {
    return <EmptyState icon={<ShoppingBag className="size-6" aria-hidden />} title={dict.checkout.emptyCart} action={<ButtonLink href={`/${locale}/store`}>{dict.cart.browseStore}</ButtonLink>} />;
  }
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
      <CheckoutForm defaultName={user.name} />
      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <CartSummary cart={cart} locale={locale} dict={dict}>
          <ul className="space-y-2 border-t border-line pt-4 text-sm">
            {cart.items.map((i) => (
              <li key={i.id} className="flex justify-between gap-3">
                <span className="min-w-0 truncate">
                  {i.product.book.title} <span className="text-muted">× {i.quantity}</span>
                </span>
                <span className="shrink-0 font-semibold">{formatMoney(i.line_total, cart.currency, locale)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-subtle">{format(dict.cart.items, { count: cart.count })}</p>
        </CartSummary>
      </aside>
    </div>
  );
}
