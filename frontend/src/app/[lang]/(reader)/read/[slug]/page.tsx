import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Loader2 } from "lucide-react";
import { getI18n } from "@/lib/i18n/server";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/ar";
import { isApiError } from "@/lib/api/errors";
import { requireUser } from "@/lib/auth/dal";
import { getBookFull, getProgress } from "@/lib/services/features";
import { examples } from "@/lib/pending/examples";
import { FeatureGate, PendingNotice } from "@/components/pending/feature-gate";
import { apiPreviewEnabled, getCapabilities } from "@/lib/pending/capabilities";
import { PdfReader } from "@/components/reader/pdf-reader";
import { ButtonLink } from "@/components/ui/button";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.reader.readNow, robots: { index: false } };
}

/** صفحة القراءة: بدون هيدر الموقع أو عناصر المتجر حتى لا تشتت القارئ */
export default async function ReadPage({ params }: PageProps<"/[lang]/read/[slug]">) {
  const { locale, dict } = await getI18n();
  return (
    <Suspense
      fallback={
        <main id="main" className="grid min-h-dvh place-items-center bg-[#f3f1ec]">
          <Loader2 className="size-6 animate-spin text-muted" aria-label={dict.reader.loading} />
        </main>
      }
    >
      <Reader params={params} locale={locale} dict={dict} />
    </Suspense>
  );
}

async function Reader({ params, locale, dict }: { params: PageProps<"/[lang]/read/[slug]">["params"]; locale: Locale; dict: Dictionary }) {
  const { slug } = await params;
  await requireUser(locale, `/read/${slug}`);

  let book;
  try {
    book = await getBookFull(slug);
  } catch (error) {
    if (isApiError(error) && error.isNotFound) notFound();
    throw error;
  }

  if (!book.has_ebook) {
    return (
      <main id="main" className="grid min-h-dvh place-items-center px-4 text-center">
        <div>
          <p className="text-lg font-semibold text-ink-900">{dict.reader.noEbook}</p>
          <ButtonLink href={`/${locale}/books/${slug}`} variant="secondary" className="mt-6">
            {dict.reader.back}
          </ButtonLink>
        </div>
      </main>
    );
  }

  const caps = await getCapabilities();
  if (!caps.reading && !apiPreviewEnabled()) {
    return (
      <main id="main" className="grid min-h-dvh place-items-center bg-paper px-4">
        <div className="w-full max-w-lg space-y-6 text-center">
          <PendingNotice feature="reading" dict={dict} className="text-start" />
          <ButtonLink href={`/${locale}/books/${slug}`} variant="secondary">
            {dict.reader.back}
          </ButtonLink>
        </div>
      </main>
    );
  }

  const b = book;
  return (
    <FeatureGate
      feature="reading"
      dict={dict}
      example={{ progress: examples.progress, live: false }}
      load={async () => ({ progress: await getProgress(slug), live: true })}
    >
      {({ progress, live }) => (
        <PdfReader slug={b.slug} title={b.title} fileUrl={live ? `/api/books/${encodeURIComponent(b.slug)}/file` : null} initialPage={progress?.page ?? 1} />
      )}
    </FeatureGate>
  );
}
