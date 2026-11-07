import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

/** شعار مكتبة لالا: كتاب مفتوح مع نقطة زعفرانية كعلامة قراءة */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={cn("size-9", className)} aria-hidden>
      <rect width="40" height="40" rx="12" className="fill-ink-700" />
      <path d="M8 13.5c4.2-1.6 8.2-1.2 12 1.2v14.8c-3.8-2.4-7.8-2.8-12-1.2V13.5Z" className="fill-paper" />
      <path d="M32 13.5c-4.2-1.6-8.2-1.2-12 1.2v14.8c3.8-2.4 7.8-2.8 12-1.2V13.5Z" className="fill-ink-100" />
      <path d="M25 11h4v9l-2-1.6-2 1.6v-9Z" className="fill-saffron-400" />
    </svg>
  );
}

export function Logo({ locale, name, className }: { locale: Locale; name: string; className?: string }) {
  return (
    <Link href={`/${locale}`} className={cn("flex items-center gap-2.5 rounded-xl", className)}>
      <LogoMark />
      <span className="font-display text-xl font-bold tracking-tight text-ink-900">{name}</span>
    </Link>
  );
}
