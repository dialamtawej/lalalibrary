import Link from "next/link";
import { BookOpenText, LogIn } from "lucide-react";
import type { BookFull } from "@/lib/api/types";
import { format, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/ar";
import { getCurrentUser } from "@/lib/auth/dal";
import { getCapabilities } from "@/lib/pending/capabilities";
import type { FeatureKey } from "@/lib/pending/contracts";
import { getProgress } from "@/lib/services/features";
import { PendingNotice } from "@/components/pending/feature-gate";
import { AddToCart } from "@/components/store/add-to-cart";
import { ButtonLink, buttonClass } from "@/components/ui/button";
import { Badge, PendingFeature } from "@/components/ui/misc";
import { apiPreviewEnabled } from "@/lib/pending/capabilities";
import { formatMoney } from "@/lib/utils";
import { FavoriteToggle, LibraryControl } from "./library-control";

/**
 * إجراءات صفحة الكتاب حسب حالة المستخدم وحالة كل ميزة في الباك إند:
 * - الميزة متاحة + مستخدم مسجل  ⇒ الزر الفعلي (قراءة، رف المكتبة، مفضلة، شراء)
 * - الميزة متاحة + زائر           ⇒ رابط تسجيل الدخول مع العودة لنفس الكتاب
 * - الميزة غير متاحة بعد          ⇒ لا زر؛ تُذكر في قائمة "قريبًا"
 */
export async function BookActions({ book, locale, dict }: { book: BookFull; locale: Locale; dict: Dictionary }) {
  const [caps, user] = await Promise.all([getCapabilities(), getCurrentUser().catch(() => null)]);
  const loginHref = (next: string) => `/${locale}/login?next=${encodeURIComponent(next)}`;
  const paperback = book.editions?.find((e) => e.format === "paperback" && e.product);
  const pending: FeatureKey[] = [];

  /* ---- القراءة ---- */
  let readAction: React.ReactNode = null;
  if (book.has_ebook) {
    if (!caps.reading) pending.push("reading");
    else if (!user) {
      readAction = (
        <ButtonLink href={loginHref(`/read/${book.slug}`)} variant="primary" size="lg" icon={<LogIn className="size-5" aria-hidden />}>
          {dict.reader.loginToRead}
        </ButtonLink>
      );
    } else {
      const progress = await getProgress(book.slug).catch(() => null);
      readAction = (
        <div className="flex flex-col gap-1.5">
          <Link href={`/${locale}/read/${book.slug}`} className={buttonClass("primary", "lg")}>
            <BookOpenText className="size-5" aria-hidden />
            {progress ? dict.reader.continueReading : dict.reader.readNow}
          </Link>
          {progress ? <span className="text-xs text-muted">{format(dict.reader.progress, { percent: Math.round(progress.percent) })}</span> : null}
        </div>
      );
    }
  }

  /* ---- المكتبة والمفضلة ---- */
  if (!caps.library) pending.push("library");
  if (!caps.favorites) pending.push("favorites");
  const libraryAction =
    caps.library && user ? <LibraryControl bookId={book.id} status={book.viewer?.library_status ?? null} /> : null;
  const favoriteAction = caps.favorites && user ? <FavoriteToggle bookId={book.id} isFavorite={!!book.viewer?.is_favorite} /> : null;
  const guestLibrary =
    !user && (caps.library || caps.favorites) ? (
      <ButtonLink href={loginHref(`/books/${book.slug}`)} variant="secondary" size="md">
        {dict.library.loginToAdd}
      </ButtonLink>
    ) : null;

  /* ---- الشراء ---- */
  let buyBox: React.ReactNode = null;
  if (!caps.store || !caps.cart) pending.push("store");
  else if (paperback?.product) {
    const p = paperback.product;
    buyBox = (
      <div className="rounded-2xl bg-surface p-5 ring-1 ring-line">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-semibold text-muted">{dict.store.printed}</span>
          {p.in_stock ? (
            <Badge tone={p.stock <= 3 ? "warning" : "success"}>{p.stock <= 3 ? format(dict.store.lowStock, { count: p.stock }) : dict.store.inStock}</Badge>
          ) : (
            <Badge tone="danger">{dict.store.outOfStock}</Badge>
          )}
        </div>
        <p className="mt-2 font-display text-3xl font-bold text-ink-900">{formatMoney(p.price, p.currency, locale)}</p>
        {p.shipping_info ? <p className="mt-1 text-sm text-muted">{p.shipping_info}</p> : null}
        <div className="mt-4">
          {!p.in_stock ? null : user ? (
            <AddToCart productId={p.id} maxQuantity={p.stock} />
          ) : (
            <ButtonLink href={loginHref(`/books/${book.slug}`)} variant="accent" className="w-full">
              {dict.store.loginToBuy}
            </ButtonLink>
          )}
        </div>
      </div>
    );
  }
  if (!caps.reviews) pending.push("reviews");

  const showContracts = apiPreviewEnabled();

  return (
    <div className="space-y-6">
      {readAction || libraryAction || favoriteAction || guestLibrary ? (
        <div className="flex flex-wrap items-start gap-3">
          {readAction}
          {libraryAction}
          {favoriteAction}
          {guestLibrary}
        </div>
      ) : null}
      {buyBox}
      {pending.length ? (
        showContracts ? (
          <div className="space-y-3">
            {pending.map((f) => (
              <PendingNotice key={f} feature={f} dict={dict} compact />
            ))}
          </div>
        ) : (
          <PendingFeature badge={dict.pending.badge} title={dict.books.details.comingTitle} items={pending.map((f) => dict.pendingFeatures[f].title)} />
        )
      ) : null}
    </div>
  );
}
