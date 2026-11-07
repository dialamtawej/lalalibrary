"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, LayoutDashboard, LogOut, UserRound } from "lucide-react";
import { logoutAction } from "@/actions/auth";
import { useI18n } from "@/lib/i18n/client";
import { Avatar } from "@/components/ui/misc";

export type MenuUser = { name: string; email: string; imageUrl: string | null; isAdmin: boolean };

/** قائمة حساب المستخدم في الهيدر (ديسكتوب) */
export function UserMenu({ user }: { user: MenuUser }) {
  const { locale, dict } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const item = "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-start text-sm font-medium text-ink-800 hover:bg-surface-2";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2 rounded-full p-1 pe-3 hover:bg-ink-50"
      >
        <Avatar name={user.name} src={user.imageUrl} size="sm" />
        <span className="max-w-32 truncate text-sm font-semibold text-ink-800">{user.name}</span>
        <ChevronDown className="size-4 text-muted" aria-hidden />
      </button>
      {open ? (
        <div role="menu" className="absolute end-0 top-full z-50 mt-2 w-64 rounded-2xl bg-surface p-2 shadow-lift ring-1 ring-line">
          <div className="border-b border-line px-3 pb-3 pt-1">
            <p className="truncate font-semibold text-ink-900">{user.name}</p>
            <p className="truncate text-xs text-muted">
              <span dir="ltr">{user.email}</span>
            </p>
          </div>
          <div className="pt-2">
            <Link role="menuitem" href={`/${locale}/account/profile`} className={item} onClick={() => setOpen(false)}>
              <UserRound className="size-4 text-muted" aria-hidden />
              {dict.nav.profile}
            </Link>
            {user.isAdmin ? (
              <Link role="menuitem" href={`/${locale}/admin`} className={item} onClick={() => setOpen(false)}>
                <LayoutDashboard className="size-4 text-muted" aria-hidden />
                {dict.nav.admin}
              </Link>
            ) : null}
            <form action={logoutAction}>
              <input type="hidden" name="lang" value={locale} />
              <button role="menuitem" type="submit" className={`${item} text-danger`}>
                <LogOut className="size-4" aria-hidden />
                {dict.nav.logout}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
