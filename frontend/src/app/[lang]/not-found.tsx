import { getI18n } from "@/lib/i18n/server";
import { ButtonLink } from "@/components/ui/button";
import { LogoMark } from "@/components/layout/logo";

export default async function NotFound() {
  const { locale, dict } = await getI18n();
  return (
    <main id="main" className="grid min-h-dvh place-items-center px-4 py-16 text-center">
      <div className="max-w-md">
        <LogoMark className="mx-auto size-14" />
        <p className="mt-8 font-display text-7xl font-bold text-saffron-500">404</p>
        <h1 className="mt-4 font-display text-3xl font-bold text-ink-900">{dict.errors.notFoundPageTitle}</h1>
        <p className="mt-3 text-muted">{dict.errors.notFoundPageHint}</p>
        <ButtonLink href={`/${locale}`} className="mt-8">
          {dict.errors.goHome}
        </ButtonLink>
      </div>
    </main>
  );
}
