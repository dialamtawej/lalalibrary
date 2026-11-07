import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, ShoppingBag } from "lucide-react";
import { getI18n } from "@/lib/i18n/server";
import { format, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/ar";
import type { Cart } from "@/lib/api/types";
import { requireUser } from "@/lib/auth/dal";
import { getCart } from "@/lib/services/features";
import { examples } from "@/lib/pending/examples";
import { FeatureGate } from "@/components/pending/feature-gate";
import { BookCover } from "@/components/books/book-cover";
import { CartItemControls } from "@/components/store/cart-controls";
import { CartSummary } from "@/components/store/cart-summary";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState, PageHeader, Skeleton } from "@/components/ui/misc";
import { formatMoney } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.cart.title, robots: { index: false } };
}

export default async function CartPage() {
  const { locale, dict } = await getI18n();
  return (
    <div className="container-page max-w-6xl py-10 sm:py-14">
      <PageHeader title={dict.cart.title} />
      <div className="mt-8">
        <Suspense fallback={<Skeleton className="h-80 rounded-[var(--radius-card)]" />}>
          <CartContent locale={locale} dict={dict} />
        </Suspense>
      </div>
    </div>
  );
}

async function CartContent({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  await requireUser(locale, "/cart");
  return (
    <FeatureGate feature="cart" dict={dict} load={getCart} example={examples.cart}>
      {(cart) => <CartView cart={cart} locale={locale} dict={dict} />}
    </FeatureGate>
  );
}

function CartView({ cart, locale, dict }: { cart: Cart; locale: Locale; dict: Dictionary }) {
  if (!cart.items.length) {
    return (
      <EmptyState
        icon={<ShoppingBag className="size-6" aria-hidden />}
        title={dict.cart.empty}
        description={dict.cart.emptyHint}
        action={<ButtonLink href={`/${locale}/store`}>{dict.cart.browseStore}</ButtonLink>}
      />
    );
  }
  const blocked = cart.items.some((i) => !i.available);
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
      <section aria-label={format(dict.cart.items, { count: cart.count })}>
        <p className="mb-4 text-sm font-semibold text-muted">{format(dict.cart.items, { count: cart.count })}</p>
        <ul className="divide-y divide-line rounded-[var(--radius-card)] bg-surface shadow-soft ring-1 ring-line">
          {cart.items.map((item) => (
            <li key={item.id} className="flex gap-4 p-4 sm:p-5">
              <Link href={`/${locale}/books/${item.product.book.slug}`} className="w-16 shrink-0 sm:w-20">
                <BookCover title={item.product.book.title} src={item.product.book.cover_url} seed={item.product.book.id} sizes="80px" />
              </Link>
              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <Link href={`/${locale}/books/${item.product.book.slug}`} className="font-semibold text-ink-900 hover:underline">
                      {item.product.book.title}
                    </Link>
                    <p className="mt-1 text-sm text-muted">{formatMoney(item.unit_price, cart.currency, locale)}</p>
                    {!item.available ? (
                      <p className="mt-1 inline-flex items-center gap-1 text-sm text-warning">
                        <AlertTriangle className="size-4" aria-hidden />
                        {dict.cart.unavailable}
                      </p>
                    ) : null}
                  </div>
                  <p className="font-display text-xl font-bold text-ink-900">{formatMoney(item.line_total, cart.currency, locale)}</p>
                </div>
                <div className="mt-3">
                  <CartItemControls itemId={item.id} quantity={item.quantity} max={item.product.stock} title={item.product.book.title} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <CartSummary cart={cart} locale={locale} dict={dict}>
          {blocked ? null : (
            <ButtonLink href={`/${locale}/checkout`} variant="accent" size="lg" className="w-full">
              {dict.cart.checkout}
            </ButtonLink>
          )}
        </CartSummary>
      </aside>
    </div>
  );
}
