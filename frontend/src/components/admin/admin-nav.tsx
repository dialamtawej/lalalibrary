"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookCopy, LayoutGrid, Menu, Shapes, Users, X, type LucideIcon } from "lucide-react";
import { useI18n } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";
import { isActivePath } from "@/components/layout/nav-links";

type Item = { href: string; label: string; Icon: LucideIcon; exact?: boolean };

function useItems(): Item[] {
  const { locale, dict } = useI18n();
  const base = `/${locale}/admin`;
  return [
    { href: base, label: dict.admin.nav.overview, Icon: LayoutGrid, exact: true },
    { href: `${base}/books`, label: dict.admin.nav.books, Icon: BookCopy },
    { href: `${base}/categories`, label: dict.admin.nav.categories, Icon: Shapes },
    { href: `${base}/users`, label: dict.admin.nav.users, Icon: Users },
  ];
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const items = useItems();
  const pathname = usePathname();
  return (
    <ul className="space-y-1">
      {items.map(({ href, label, Icon, exact }) => {
        const active = isActivePath(pathname, href, exact);
        return (
          <li key={href}>
            <Link
              href={href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 font-semibold transition-colors",
                active ? "bg-saffron-400 text-ink-900" : "text-ink-100 hover:bg-white/10 hover:text-white",
              )}
            >
              <Icon className="size-5" aria-hidden />
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/** الشريط الجانبي (ديسكتوب) */
export function AdminSidebarNav() {
  return <NavList />;
}

/** زر القائمة ودرج التنقل (موبايل وتابلت) */
export function AdminMobileNav({ children }: { children?: React.ReactNode }) {
  const { dict } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="grid size-11 place-items-center rounded-full text-ink-800 hover:bg-ink-50 lg:hidden" aria-label={dict.common.menu} aria-expanded={open}>
        <Menu className="size-6" aria-hidden />
      </button>
      <dialog ref={ref} onClose={() => setOpen(false)} onClick={(e) => e.target === ref.current && setOpen(false)} className="m-0 me-auto h-dvh max-h-none w-[min(18rem,85vw)] max-w-none bg-ink-800 p-0 text-white backdrop:bg-ink-900/50">
        <div className="flex h-full flex-col p-4">
          <div className="mb-6 flex items-center justify-between">
            <span className="font-display text-lg font-bold">{dict.admin.title}</span>
            <button type="button" onClick={() => setOpen(false)} className="grid size-11 place-items-center rounded-full hover:bg-white/10" aria-label={dict.common.close}>
              <X className="size-6" aria-hidden />
            </button>
          </div>
          <NavList onNavigate={() => setOpen(false)} />
          <div className="mt-auto">{children}</div>
        </div>
      </dialog>
    </>
  );
}
