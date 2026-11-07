import { Suspense, type ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getI18n } from "@/lib/i18n/server";
import { localeMeta, type Locale } from "@/lib/i18n/config";
import { requireAdmin } from "@/lib/auth/dal";
import { LogoMark } from "@/components/layout/logo";
import { AdminMobileNav, AdminSidebarNav } from "@/components/admin/admin-nav";
import { Avatar, Skeleton } from "@/components/ui/misc";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: { default: dict.admin.title, template: `%s · ${dict.admin.title}` }, robots: { index: false } };
}

export default async function AdminLayout({ children }: LayoutProps<"/[lang]/admin">) {
  const { locale, dict } = await getI18n();
  const Back = localeMeta[locale].dir === "rtl" ? ArrowRight : ArrowLeft;

  const backLink = (
    <Link href={`/${locale}`} className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-ink-100 hover:bg-white/10 hover:text-white">
      <Back className="size-4" aria-hidden />
      {dict.admin.backToSite}
    </Link>
  );

  return (
    <div className="min-h-dvh bg-paper lg:grid lg:grid-cols-[17rem_1fr]">
      {/* الشريط الجانبي للديسكتوب */}
      <aside className="sticky top-0 hidden h-dvh flex-col bg-ink-800 p-4 text-white lg:flex">
        <Link href={`/${locale}/admin`} className="mb-8 flex items-center gap-3 px-2 pt-2">
          <LogoMark className="size-10" />
          <span>
            <span className="block font-display text-lg font-bold leading-tight">{dict.common.appName}</span>
            <span className="block text-xs text-ink-200">{dict.admin.title}</span>
          </span>
        </Link>
        <nav aria-label={dict.admin.title}>
          <Suspense fallback={null}>
            <AdminSidebarNav />
          </Suspense>
        </nav>
        <div className="mt-auto space-y-3">
          {backLink}
          <Suspense fallback={<Skeleton className="h-14 bg-white/10" />}>
            <AdminUserChip locale={locale} />
          </Suspense>
        </div>
      </aside>

      <div className="min-w-0">
        {/* شريط علوي للموبايل والتابلت */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-paper/90 px-4 backdrop-blur lg:hidden">
          <Suspense fallback={<span className="size-11" />}>
            <AdminMobileNav>{backLink}</AdminMobileNav>
          </Suspense>
          <span className="font-display text-lg font-bold text-ink-900">{dict.admin.title}</span>
        </header>

        <main id="main" className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
          <Suspense fallback={<AdminContentSkeleton />}>
            <AdminGate locale={locale}>{children}</AdminGate>
          </Suspense>
        </main>
      </div>
    </div>
  );
}

/** يتحقق أن المستخدم أدمن قبل عرض أي محتوى (Laravel يتحقق أيضًا في كل طلب) */
async function AdminGate({ locale, children }: { locale: Locale; children: ReactNode }) {
  await requireAdmin(locale, "/admin");
  return <>{children}</>;
}

async function AdminUserChip({ locale }: { locale: Locale }) {
  const user = await requireAdmin(locale, "/admin");
  return (
    <Link href={`/${locale}/account/profile`} className="flex items-center gap-3 rounded-2xl bg-white/[0.06] p-3 hover:bg-white/10">
      <Avatar name={user.name} src={user.image_url} size="sm" />
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold">{user.name}</span>
        <span className="block truncate text-xs text-ink-200">
          <span dir="ltr">{user.email}</span>
        </span>
      </span>
    </Link>
  );
}

function AdminContentSkeleton() {
  return (
    <div className="space-y-6" aria-hidden>
      <Skeleton className="h-10 w-64" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-28 rounded-[var(--radius-card)]" />
        ))}
      </div>
      <Skeleton className="h-80 rounded-[var(--radius-card)]" />
    </div>
  );
}

