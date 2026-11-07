import { Suspense } from "react";
import { Search } from "lucide-react";
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

export function siteNav(locale: Locale, dict: Dictionary): NavItem[] {
  return [
    { href: `/${locale}`, label: dict.nav.home, exact: true },
    { href: `/${locale}/books`, label: dict.nav.books },
    { href: `/${locale}/categories`, label: dict.nav.categories },
  ];
}

/**
 * الهيدر ثابت (يُبنى مسبقًا في الـ Static Shell)،
 * والجزء الذي يعتمد على المستخدم (قراءة الكوكي) داخل Suspense فيُبث لاحقًا.
 */
export function SiteHeader({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const items = siteNav(locale, dict);
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-paper/85 backdrop-blur-md">
      <div className="container-page flex h-16 items-center gap-4 sm:h-18">
        <Logo locale={locale} name={dict.common.appName} />
        <nav aria-label={dict.common.menu} className="ms-6 hidden md:block">
          {/* usePathname يحتاج Suspense؛ الـ fallback نفس الروابط بدون إبراز */}
          <Suspense fallback={<StaticNavLinks items={items} className="flex items-center gap-1" />}>
            <NavLinks items={items} className="flex items-center gap-1" />
          </Suspense>
        </nav>
        <div className="ms-auto flex items-center gap-1 sm:gap-2">
          <Link href={`/${locale}/books`} className="grid size-11 place-items-center rounded-full text-ink-700 hover:bg-ink-50 md:hidden" aria-label={dict.common.search}>
            <Search className="size-5" aria-hidden />
          </Link>
          <Suspense fallback={<span className="hidden h-10 w-20 sm:block" />}>
            <LanguageSwitcher className="hidden sm:inline-flex" />
          </Suspense>
          <Suspense fallback={<HeaderActionsSkeleton />}>
            <HeaderActions locale={locale} dict={dict} items={items} />
          </Suspense>
        </div>
      </div>
    </header>
  );
}

async function HeaderActions({ locale, dict, items }: { locale: Locale; dict: Dictionary; items: NavItem[] }) {
  const user = await getCurrentUser().catch(() => null);
  const menuUser: MenuUser | null = user
    ? { name: user.name, email: user.email, imageUrl: user.image_url, isAdmin: isAdmin(user) }
    : null;

  return (
    <>
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
