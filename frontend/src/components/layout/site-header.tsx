import { Suspense } from "react";
import { Bell, Search, ShoppingCart } from "lucide-react";
import type { ReactNode } from "react";
import { getCapabilities, type Capabilities } from "@/lib/pending/capabilities";
import { getCart, getUnreadCount } from "@/lib/services/features";
import Link from "next/link";
import { getCurrentUser, isAdmin } from "@/lib/auth/dal";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/ar";
import { ButtonLink } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/misc";
import { Logo } from "./logo";
import { NavLinks, StaticNavLinks, type NavItem } from "./nav-links";
import { LanguageSwitcher } from "./language-switcher";
import { UserMenu, type MenuUser } from "./user-menu";
import { MobileNav } from "./mobile-nav";

/**
 * روابط التنقل: "المؤلفون" و"المتجر" تظهر فقط عندما تتوفر خدماتها في الباك إند،
 * حتى لا يصل الزائر إلى صفحات فارغة. (في وضع المعاينة افتحي /authors و /store مباشرة.)
 * ملاحظة: الهيدر جزء من الـ Static Shell، فلا يعتمد على متغيرات وقت التشغيل.
 */
export function siteNav(locale: Locale, dict: Dictionary, caps: Capabilities): NavItem[] {
  return [
    { href: `/${locale}`, label: dict.nav.home, exact: true },
    { href: `/${locale}/books`, label: dict.nav.books },
    { href: `/${locale}/categories`, label: dict.nav.categories },
    ...(caps.authors ? [{ href: `/${locale}/authors`, label: dict.nav.authors }] : []),
    ...(caps.store ? [{ href: `/${locale}/store`, label: dict.nav.store }] : []),
  ];
}

/**
 * الهيدر ثابت (يُبنى مسبقًا في الـ Static Shell)،
 * والجزء الذي يعتمد على المستخدم (قراءة الكوكي) داخل Suspense فيُبث لاحقًا.
 */
export async function SiteHeader({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const caps = await getCapabilities();
  const items = siteNav(locale, dict, caps);
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-paper/85 backdrop-blur-md">
      <div className="container-page flex h-16 items-center gap-2 sm:h-18 sm:gap-4">
        <Logo locale={locale} name={dict.common.appName} />
        <nav aria-label={dict.common.menu} className="ms-6 hidden md:block">
          {/* usePathname يحتاج Suspense؛ الـ fallback نفس الروابط بدون إبراز */}
          <Suspense fallback={<StaticNavLinks items={items} className="flex items-center gap-1" />}>
            <NavLinks items={items} className="flex items-center gap-1" />
          </Suspense>
        </nav>
        <div className="ms-auto flex items-center gap-0 sm:gap-2">
          <Link href={`/${locale}/books`} className="grid size-10 place-items-center rounded-full text-ink-700 hover:bg-ink-50 sm:size-11 md:hidden" aria-label={dict.common.search}>
            <Search className="size-5" aria-hidden />
          </Link>
          {/* على الموبايل يوجد تبديل اللغة داخل الفوتر */}
          <span className="hidden sm:inline-flex">
            <Suspense fallback={<span className="h-10 w-20" />}>
              <LanguageSwitcher />
            </Suspense>
          </span>
          <Suspense fallback={<HeaderActionsSkeleton />}>
            <HeaderActions locale={locale} dict={dict} items={items} caps={caps} />
          </Suspense>
        </div>
      </div>
    </header>
  );
}

async function HeaderActions({ locale, dict, items, caps }: { locale: Locale; dict: Dictionary; items: NavItem[]; caps: Capabilities }) {
  const user = await getCurrentUser().catch(() => null);
  // عدّادات السلة والإشعارات (§7، §10) — فقط للمستخدم المسجل وعند توفر الخدمة
  const [cartCount, unread] = user
    ? await Promise.all([
        caps.cart ? getCart().then((c) => c.count).catch(() => null) : null,
        caps.notifications ? getUnreadCount().catch(() => null) : null,
      ])
    : [null, null];
  const menuUser: MenuUser | null = user
    ? { name: user.name, email: user.email, imageUrl: user.image_url, isAdmin: isAdmin(user) }
    : null;

  return (
    <>
      {unread !== null ? (
        <IconLink href={`/${locale}/account/notifications`} label={dict.nav.notifications} count={unread}>
          <Bell className="size-5" aria-hidden />
        </IconLink>
      ) : null}
      {cartCount !== null ? (
        <IconLink href={`/${locale}/cart`} label={dict.nav.cart} count={cartCount}>
          <ShoppingCart className="size-5" aria-hidden />
        </IconLink>
      ) : null}
      <div className="hidden items-center gap-2 md:flex">
        {menuUser ? (
          <UserMenu user={menuUser} />
        ) : (
          <>
            <ButtonLink href={`/${locale}/login`} variant="ghost" size="sm">
              {dict.nav.login}
            </ButtonLink>
            <ButtonLink href={`/${locale}/register`} variant="accent" size="sm">
              {dict.nav.register}
            </ButtonLink>
          </>
        )}
      </div>
      <Suspense fallback={<span className="size-11 md:hidden" />}>
        <MobileNav items={items} user={menuUser} />
      </Suspense>
    </>
  );
}

function HeaderActionsSkeleton() {
  return (
    <>
      <Skeleton className="hidden h-10 w-40 rounded-full md:block" />
      <Skeleton className="size-11 rounded-full md:hidden" />
    </>
  );
}

function IconLink({ href, label, count, children }: { href: string; label: string; count: number; children: ReactNode }) {
  return (
    <Link href={href} className="relative grid size-10 place-items-center rounded-full text-ink-700 hover:bg-ink-50 sm:size-11" aria-label={count ? `${label} (${count})` : label}>
      {children}
      {count > 0 ? (
        <span aria-hidden className="absolute end-1 top-1 grid min-w-5 place-items-center rounded-full bg-saffron-400 px-1 text-[0.7rem] font-bold leading-5 text-ink-900">
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </Link>
  );
}
