import { Suspense } from "react";
import Link from "next/link";
import { BookCopy, BookPlus, ChartNoAxesCombined, FolderPlus, Shapes, UserCog, UserX, Users, type LucideIcon } from "lucide-react";
import { getI18n } from "@/lib/i18n/server";
import { format, type Locale } from "@/lib/i18n/config";
import { getCurrentUser } from "@/lib/auth/dal";
import { adminListBooks, adminListCategories } from "@/lib/services/catalog";
import { listUsers } from "@/lib/services/users";
import { PageHeader, PendingFeature, Skeleton } from "@/components/ui/misc";
import { formatNumber } from "@/lib/utils";

export default async function AdminOverviewPage() {
  const { locale, dict } = await getI18n();
  const user = await getCurrentUser();
  const t = dict.admin.overview;

  return (
    <div className="space-y-10">
      <PageHeader eyebrow={dict.admin.title} title={format(t.greeting, { name: user?.name ?? "" })} description={t.subtitle} />

      <section aria-label={dict.admin.title} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Suspense fallback={<StatSkeleton />}>
          <Stat label={t.books} Icon={BookCopy} tone="bg-saffron-100 text-ink-900" href={`/${locale}/admin/books`} load={() => adminListBooks({ per_page: 1 }).then((p) => p.total)} locale={locale} />
        </Suspense>
        <Suspense fallback={<StatSkeleton />}>
          <Stat label={t.categories} Icon={Shapes} tone="bg-plum-50 text-plum-700" href={`/${locale}/admin/categories`} load={() => adminListCategories().then((c) => c.length)} locale={locale} />
        </Suspense>
        <Suspense fallback={<StatSkeleton />}>
          <Stat label={t.users} Icon={Users} tone="bg-ink-50 text-ink-800" href={`/${locale}/admin/users`} load={() => listUsers({ per_page: 1 }).then((p) => p.total)} locale={locale} />
        </Suspense>
        <Suspense fallback={<StatSkeleton />}>
          <Stat label={t.bannedUsers} Icon={UserX} tone="bg-danger-soft text-danger" href={`/${locale}/admin/users?status=banned`} load={() => listUsers({ per_page: 1, status: "banned" }).then((p) => p.total)} locale={locale} />
        </Suspense>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <section>
          <h2 className="mb-4 text-lg font-bold text-ink-900">{t.quickActions}</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <QuickAction href={`/${locale}/admin/books/new`} Icon={BookPlus} label={t.addBook} />
            <QuickAction href={`/${locale}/admin/categories?new=1`} Icon={FolderPlus} label={t.addCategory} />
            <QuickAction href={`/${locale}/admin/users`} Icon={UserCog} label={t.manageUsers} />
          </div>
        </section>
        <PendingFeature badge={dict.pending.badge} title={<span className="inline-flex items-center gap-2"><ChartNoAxesCombined className="size-4" aria-hidden />{t.pendingStatsTitle}</span>} description={t.pendingStatsHint} />
      </div>
    </div>
  );
}

async function Stat({ label, Icon, tone, href, load, locale }: { label: string; Icon: LucideIcon; tone: string; href: string; load: () => Promise<number>; locale: Locale }) {
  let value: string;
  try {
    value = formatNumber(await load(), locale);
  } catch {
    value = "—";
  }
  return (
    <Link href={href} className="group rounded-[var(--radius-card)] bg-surface p-5 shadow-soft ring-1 ring-line transition-shadow hover:shadow-lift">
      <span className={`grid size-11 place-items-center rounded-xl ${tone}`}>
        <Icon className="size-5" aria-hidden />
      </span>
      <p className="mt-4 font-display text-3xl font-bold text-ink-900">{value}</p>
      <p className="mt-1 text-sm font-semibold text-muted">{label}</p>
    </Link>
  );
}

function StatSkeleton() {
  return <Skeleton className="h-36 rounded-[var(--radius-card)]" />;
}

function QuickAction({ href, Icon, label }: { href: string; Icon: LucideIcon; label: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 rounded-2xl bg-surface p-4 font-semibold text-ink-800 ring-1 ring-line transition-colors hover:bg-saffron-50 hover:ring-saffron-300">
      <span className="grid size-10 place-items-center rounded-xl bg-saffron-400 text-ink-900">
        <Icon className="size-5" aria-hidden />
      </span>
      {label}
    </Link>
  );
}

