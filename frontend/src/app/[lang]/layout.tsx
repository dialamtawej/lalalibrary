import type { Metadata, Viewport } from "next";
import "../globals.css";
import { locales, localeMeta } from "@/lib/i18n/config";
import { getI18n } from "@/lib/i18n/server";
import { I18nProvider } from "@/lib/i18n/client";
import { fontVariables } from "../fonts";

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata(): Promise<Metadata> {
  const { locale, dict } = await getI18n();
  return {
    title: { default: dict.meta.title, template: `%s · ${dict.meta.title}` },
    description: dict.meta.description,
    alternates: {
      languages: Object.fromEntries(locales.map((l) => [l, `/${l}`])),
    },
    openGraph: { siteName: dict.meta.title, locale: localeMeta[locale].intl.replace("-", "_") },
  };
}

export const viewport: Viewport = {
  themeColor: "#fbf8f1",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: LayoutProps<"/[lang]">) {
  const { locale, dict } = await getI18n();

  return (
    <html lang={locale} dir={localeMeta[locale].dir} className={fontVariables}>
      <body className="min-h-dvh antialiased">
        <a href="#main" className="sr-only z-[60] rounded-full bg-ink-800 px-4 py-2 text-white focus:not-sr-only focus:fixed focus:start-4 focus:top-4">
          {dict.common.skipToContent}
        </a>
        <I18nProvider locale={locale} dict={dict}>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
