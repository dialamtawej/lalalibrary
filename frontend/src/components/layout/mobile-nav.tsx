"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, LogIn, LogOut, Menu, UserPlus, UserRound, X } from "lucide-react";
import { logoutAction } from "@/actions/auth";
import { useI18n } from "@/lib/i18n/client";
import { Avatar } from "@/components/ui/misc";
import { buttonClass } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { isActivePath, type NavItem } from "./nav-links";
import type { MenuUser } from "./user-menu";

/** قائمة الموبايل: درج جانبي بعنصر <dialog> */
export function MobileNav({ items, user }: { items: NavItem[]; user: MenuUser | null }) {
  const { locale, dict } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const close = () => setOpen(false);
  const link = "flex items-center gap-3 rounded-2xl px-4 py-3.5 text-base font-semibold";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="grid size-10 place-items-center rounded-full text-ink-800 hover:bg-ink-50 sm:size-11 md:hidden"
        aria-label={dict.common.menu}
        aria-expanded={open}
      >
        <Menu className="size-6" aria-hidden />
      </button>
      <dialog
        ref={ref}
        onClose={close}
        onClick={(e) => e.target === ref.current && close()}
        className="m-0 ms-auto h-dvh max-h-none w-[min(22rem,88vw)] max-w-none bg-paper p-0 text-fg backdrop:bg-ink-900/40"
      >
        <div className="flex h-full flex-col p-4">
          <div className="flex items-center justify-between">
            <span className="font-display text-lg font-bold text-ink-900">{dict.common.appName}</span>
            <button type="button" onClick={close} className="grid size-11 place-items-center rounded-full hover:bg-surface-2" aria-label={dict.common.close}>
              <X className="size-6" aria-hidden />
            </button>
          </div>

          {user ? (
            <div className="mt-4 flex items-center gap-3 rounded-2xl bg-surface p-3 ring-1 ring-line">
              <Avatar name={user.name} src={user.imageUrl} />
              <div className="min-w-0">
                <p className="truncate font-semibold">{user.name}</p>
                <p className="truncate text-xs text-muted">
                  <span dir="ltr">{user.email}</span>
                </p>
              </div>
            </div>
          ) : null}

          <nav className="mt-4 flex-1 overflow-y-auto">
            <ul className="space-y-1">
              {items.map((item) => {
                const active = isActivePath(pathname, item.href, item.exact);
                return (
                  <li key={item.href}>
                    <Link href={item.href} onClick={close} aria-current={active ? "page" : undefined} className={cn(link, active ? "bg-saffron-100 text-ink-900" : "text-ink-800 hover:bg-surface-2")}>
                      {item.label}
                    </Link>
                  </li>
                );
              })}
              {user ? (
                <>
                  <li className="my-2 border-t border-line" aria-hidden />
                  <li>
                    <Link href={`/${locale}/account/profile`} onClick={close} className={cn(link, "text-ink-800 hover:bg-surface-2")}>
                      <UserRound className="size-5 text-muted" aria-hidden />
                      {dict.nav.profile}
                    </Link>
                  </li>
                  {user.isAdmin ? (
                    <li>
                      <Link href={`/${locale}/admin`} onClick={close} className={cn(link, "text-ink-800 hover:bg-surface-2")}>
                        <LayoutDashboard className="size-5 text-muted" aria-hidden />
                        {dict.nav.admin}
                      </Link>
                    </li>
                  ) : null}
                </>
              ) : null}
            </ul>
          </nav>

          <div className="space-y-2 border-t border-line pt-4">
            {user ? (
              <form action={logoutAction}>
                <input type="hidden" name="lang" value={locale} />
                <button type="submit" className={buttonClass("danger-soft", "lg", "w-full")}>
                  <LogOut className="size-5" aria-hidden />
                  {dict.nav.logout}
                </button>
              </form>
            ) : (
              <>
                <Link href={`/${locale}/login`} onClick={close} className={buttonClass("primary", "lg", "w-full")}>
                  <LogIn className="size-5" aria-hidden />
                  {dict.nav.login}
                </Link>
                <Link href={`/${locale}/register`} onClick={close} className={buttonClass("secondary", "lg", "w-full")}>
                  <UserPlus className="size-5" aria-hidden />
                  {dict.nav.register}
                </Link>
              </>
            )}
          </div>
        </div>
      </dialog>
    </>
  );
}
