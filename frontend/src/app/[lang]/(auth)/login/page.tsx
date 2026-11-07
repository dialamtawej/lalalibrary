import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { getI18n } from "@/lib/i18n/server";
import { LoginForm } from "@/components/auth/auth-forms";
import { Skeleton } from "@/components/ui/misc";
import { param, safeNextPath } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.nav.login, robots: { index: false } };
}

export default async function LoginPage({ searchParams }: PageProps<"/[lang]/login">) {
  const { locale, dict } = await getI18n();
  return (
    <>
      <h1 className="font-display text-4xl font-bold text-ink-900">{dict.auth.loginTitle}</h1>
      <p className="mt-2 text-muted">{dict.auth.loginSubtitle}</p>
      <div className="mt-8">
        <Suspense fallback={<FormSkeleton />}>
          <LoginFormWithNext searchParams={searchParams} />
        </Suspense>
      </div>
      <p className="mt-8 text-center text-sm text-muted">
        {dict.auth.noAccount}{" "}
        <Link href={`/${locale}/register`} className="font-semibold text-ink-700 underline-offset-4 hover:underline">
          {dict.nav.register}
        </Link>
      </p>
    </>
  );
}

async function LoginFormWithNext({ searchParams }: { searchParams: PageProps<"/[lang]/login">["searchParams"] }) {
  const sp = await searchParams;
  return <LoginForm next={safeNextPath(param(sp.next)) ?? undefined} />;
}

function FormSkeleton() {
  return (
    <div className="space-y-5" aria-hidden>
      <Skeleton className="h-20" />
      <Skeleton className="h-20" />
      <Skeleton className="h-13 rounded-full" />
    </div>
  );
}
