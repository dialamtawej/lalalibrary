import { Suspense } from "react";
import Link from "next/link";
import { BookCopy, BookPlus, FolderPlus, Shapes, UserCog, UserX, Users, type LucideIcon } from "lucide-react";
import { getI18n } from "@/lib/i18n/server";
import { format, type Locale } from "@/lib/i18n/config";
import { getCurrentUser } from "@/lib/auth/dal";
import { adminListBooks, adminListCategories } from "@/lib/services/catalog";
import { listUsers } from "@/lib/services/users";
import { Card, CardTitle, PageHeader, Skeleton } from "@/components/ui/misc";
import { FeatureGate } from "@/components/pending/feature-gate";
import { getAdminStats } from "@/lib/services/features";
import { examples } from "@/lib/pending/examples";
import type { AdminStats } from "@/lib/api/types";
import type { Dictionary } from "@/lib/i18n/dictionaries/ar";
import { formatMoney, formatNumber } from "@/lib/utils";

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
        <Suspense fallback={<StatSkeleton />}>
          <FeatureGate feature="stats" dict={dict} load={getAdminStats} example={examples.stats} compact>
            {(stats) => <StatsPanel stats={stats} locale={locale} dict={dict} />}
          </FeatureGate>
        </Suspense>
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


/** إحصائيات §12: تظهر تلقائيًا عند توفر GET /admin/stats */
function StatsPanel({ stats, locale, dict }: { stats: AdminStats; locale: Locale; dict: Dictionary }) {
  const t = dict.adminStats;
  const rows: [string, string][] = [
    [t.orders, formatNumber(stats.orders.total, locale)],
    [t.pendingOrders, formatNumber(stats.orders.pending, locale)],
    [t.revenue, formatMoney(stats.orders.revenue, stats.orders.currency, locale)],
    [t.activeReaders, formatNumber(stats.reading.active_readers_30d, locale)],
    [t.reportedReviews, formatNumber(stats.reviews.reported_open, locale)],
  ];
  return (
    <Card>
      <dl className="divide-y divide-line text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between py-2">
            <dt className="text-muted">{label}</dt>
            <dd className="font-bold text-ink-900">{value}</dd>
          </div>
        ))}
      </dl>
      {stats.top_books.length ? (
        <div className="mt-4">
          <CardTitle className="mb-2">{t.topBooks}</CardTitle>
          <ol className="space-y-1 text-sm">
            {stats.top_books.map((b) => (
              <li key={b.id} className="flex justify-between gap-2">
                <span className="truncate">{b.title}</span>
                <span className="shrink-0 text-muted">{format(t.reads, { count: formatNumber(b.reads, locale) })}</span>
              </li>
            ))}
          </ol>
        </div>
      ) : null}
      {stats.low_stock.length ? (
        <div className="mt-4">
          <CardTitle className="mb-2">{t.lowStock}</CardTitle>
          <ul className="space-y-1 text-sm">
            {stats.low_stock.map((p) => (
              <li key={p.product_id} className="flex justify-between gap-2">
                <span className="truncate">{p.title}</span>
                <span className="shrink-0 font-semibold text-warning">{p.stock}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </Card>
  );
}
