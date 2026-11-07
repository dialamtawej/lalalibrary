import type { Metadata } from "next";
import Link from "next/link";
import { getI18n } from "@/lib/i18n/server";
import { RegisterForm } from "@/components/auth/auth-forms";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.nav.register };
}

export default async function RegisterPage() {
  const { locale, dict } = await getI18n();
  return (
    <>
      <h1 className="font-display text-4xl font-bold text-ink-900">{dict.auth.registerTitle}</h1>
      <p className="mt-2 text-muted">{dict.auth.registerSubtitle}</p>
      <div className="mt-8">
        <RegisterForm />
      </div>
      <p className="mt-8 text-center text-sm text-muted">
        {dict.auth.haveAccount}{" "}
        <Link href={`/${locale}/login`} className="font-semibold text-ink-700 underline-offset-4 hover:underline">
          {dict.nav.login}
        </Link>
      </p>
    </>
  );
}
