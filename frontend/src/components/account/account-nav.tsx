"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Heart, Library, Package, UserRound } from "lucide-react";
import { useI18n } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";
import { isActivePath } from "@/components/layout/nav-links";

/** تبويبات حسابي: شريط أفقي قابل للتمرير على الموبايل */
export function AccountNav() {
  const { locale, dict } = useI18n();
  const pathname = usePathname();
  const base = `/${locale}/account`;
  const items = [
    { href: `${base}/profile`, label: dict.nav.profile, Icon: UserRound },
    { href: `${base}/library`, label: dict.nav.library, Icon: Library },
    { href: `${base}/favorites`, label: dict.nav.favorites, Icon: Heart },
    { href: `${base}/orders`, label: dict.nav.orders, Icon: Package },
    { href: `${base}/notifications`, label: dict.nav.notifications, Icon: Bell },
  ];
  return (
    <nav aria-label={dict.account.title} className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <ul className="flex min-w-max gap-2 border-b border-line pb-3">
        {items.map(({ href, label, Icon }) => {
          const active = isActivePath(pathname, href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn("inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors", active ? "bg-ink-700 text-white" : "text-ink-800 hover:bg-surface-2")}
              >
                <Icon className="size-4" aria-hidden />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
