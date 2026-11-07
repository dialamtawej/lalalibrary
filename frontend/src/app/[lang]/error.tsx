"use client";

import { useEffect } from "react";
import { useI18n } from "@/lib/i18n/client";
import { Button, ButtonLink } from "@/components/ui/button";

export default function ErrorPage({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  const { locale, dict } = useI18n();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main id="main" className="grid min-h-[60dvh] place-items-center px-4 py-16 text-center">
      <div className="max-w-md">
        <h1 className="font-display text-3xl font-bold text-ink-900">{dict.errors.errorPageTitle}</h1>
        <p className="mt-3 text-muted">{dict.errors.generic}</p>
        <div className="mt-8 flex justify-center gap-3">
          <Button onClick={() => retry()}>{dict.common.retry}</Button>
          <ButtonLink href={`/${locale}`} variant="secondary">
            {dict.errors.goHome}
          </ButtonLink>
        </div>
      </div>
    </main>
  );
}
