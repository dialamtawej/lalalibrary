import Link from "next/link";
import { Suspense } from "react";
import { format, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/ar";
import { Logo } from "./logo";
import { LanguageSwitcher } from "./language-switcher";
import { CurrentYear } from "./current-year";

export function SiteFooter({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <footer className="mt-24 border-t border-line bg-surface-2/60">
      <div className="container-page grid gap-10 py-12 sm:grid-cols-[2fr_1fr]">
        <div className="max-w-sm space-y-3">
          <Logo locale={locale} name={dict.common.appName} />
          <p className="text-sm text-muted">{dict.footer.about}</p>
        </div>
        <div>
          <p className="mb-3 text-sm font-bold text-ink-900">{dict.footer.explore}</p>
          <ul className="space-y-2 text-sm">
            <li>
              <Link className="text-muted hover:text-ink-800" href={`/${locale}/books`}>
                {dict.nav.books}
              </Link>
            </li>
            <li>
              <Link className="text-muted hover:text-ink-800" href={`/${locale}/categories`}>
                {dict.nav.categories}
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-5 text-xs text-subtle sm:flex-row">
          <p>
            <Suspense fallback={format(dict.footer.rights, { year: "" })}>
              <CurrentYear template={dict.footer.rights} />
            </Suspense>
          </p>
          <Suspense fallback={null}>
            <LanguageSwitcher className="h-8 text-xs" />
          </Suspense>
        </div>
      </div>
    </footer>
  );
}
