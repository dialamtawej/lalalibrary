"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Languages } from "lucide-react";
import { useI18n } from "@/lib/i18n/client";
import { stripLocale, cn } from "@/lib/utils";

/** يبدّل اللغة مع الحفاظ على نفس الصفحة ومعاملات البحث */
export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, dict } = useI18n();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const target = locale === "ar" ? "en" : "ar";
  const qs = searchParams.toString();
  const href = `/${target}${stripLocale(pathname) === "/" ? "" : stripLocale(pathname)}${qs ? `?${qs}` : ""}`;

  return (
    <Link
      href={href}
      hrefLang={target}
      lang={target}
      aria-label={dict.common.switchLanguageLabel}
      className={cn("inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-ink-700 hover:bg-ink-50", className)}
    >
      <Languages className="size-4" aria-hidden />
      {dict.common.switchLanguage}
    </Link>
  );
}
