"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export type NavItem = { href: string; label: string; exact?: boolean };

export function isActivePath(pathname: string, href: string, exact?: boolean) {
  return exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

/** روابط التنقل مع إبراز الصفحة الحالية */
export function NavLinks({ items, className, itemClassName }: { items: NavItem[]; className?: string; itemClassName?: string }) {
  const pathname = usePathname();
  return (
    <ul className={className}>
      {items.map((item) => {
        const active = isActivePath(pathname, item.href, item.exact);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative rounded-full px-4 py-2 font-semibold transition-colors",
                active ? "text-ink-900" : "text-muted hover:text-ink-800",
                itemClassName,
              )}
            >
              {item.label}
              {active ? <span aria-hidden className="absolute inset-x-4 -bottom-0.5 h-1 rounded-full bg-saffron-400" /> : null}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/** نفس الروابط بدون حالة "الصفحة الحالية" — تُعرض أثناء التحميل */
export function StaticNavLinks({ items, className }: { items: NavItem[]; className?: string }) {
  return (
    <ul className={className}>
      {items.map((item) => (
        <li key={item.href}>
          <Link href={item.href} className="relative rounded-full px-4 py-2 font-semibold text-muted hover:text-ink-800">
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
