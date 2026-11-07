import { getI18n } from "@/lib/i18n/server";
import { Logo } from "@/components/layout/logo";
import { BookCover } from "@/components/books/book-cover";
import { Suspense } from "react";
import { LanguageSwitcher } from "@/components/layout/language-switcher";

/** صفحات الدخول والتسجيل: نموذج مركّز + لوحة هوية بصرية على الشاشات الكبيرة */
export default async function AuthLayout({ children }: LayoutProps<"/[lang]">) {
  const { locale, dict } = await getI18n();
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1fr_minmax(0,34rem)]">
      <div className="flex flex-col px-4 py-6 sm:px-8">
        <div className="flex items-center justify-between">
          <Logo locale={locale} name={dict.common.appName} />
          <Suspense fallback={null}>
            <LanguageSwitcher />
          </Suspense>
        </div>
        <main id="main" className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
          {children}
        </main>
      </div>

      <aside aria-hidden className="relative hidden overflow-hidden bg-ink-800 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="absolute -end-24 -top-24 size-80 rounded-full bg-saffron-400/25 blur-3xl" />
        <div className="absolute -bottom-32 -start-20 size-96 rounded-full bg-plum-500/30 blur-3xl" />
        <div className="relative mt-10 flex justify-center gap-4">
          <BookCover title={dict.home.heroTitle} src={null} seed={2} className="w-32 -rotate-6" sizes="128px" />
          <BookCover title={dict.common.tagline} src={null} seed={0} className="mt-8 w-36" sizes="144px" />
          <BookCover title={dict.home.eyebrow} src={null} seed={1} className="w-32 rotate-6" sizes="128px" />
        </div>
        <div className="relative">
          <span className="ornament" />
          <p className="mt-5 font-display text-3xl font-bold leading-relaxed text-white">{dict.auth.sideQuote}</p>
          <p className="mt-4 text-ink-100">{dict.auth.sideCaption}</p>
        </div>
      </aside>
    </div>
  );
}
