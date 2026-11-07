import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Bell, BellDot, BookPlus, CheckCheck, Package, Sparkles, Tag, type LucideIcon } from "lucide-react";
import { getI18n } from "@/lib/i18n/server";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/ar";
import type { AppNotification, NotificationType, Paginated } from "@/lib/api/types";
import { requireUser } from "@/lib/auth/dal";
import { listNotifications } from "@/lib/services/features";
import { examples } from "@/lib/pending/examples";
import { markAllNotificationsReadAction, markNotificationReadAction } from "@/actions/features";
import { FeatureGate } from "@/components/pending/feature-gate";
import { ActionButton } from "@/components/ui/action-button";
import { EmptyState, PageHeader, Skeleton } from "@/components/ui/misc";
import { Pagination } from "@/components/ui/pagination";
import { cn, formatDate, pageParam, param } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.notifications.title, robots: { index: false } };
}

const icons: Record<NotificationType, LucideIcon> = {
  new_book: BookPlus,
  author_new_book: Sparkles,
  book_updated: BookPlus,
  order_status_changed: Package,
  back_in_stock: Bell,
  promotion: Tag,
};

export default async function NotificationsPage({ searchParams }: PageProps<"/[lang]/account/notifications">) {
  const { locale, dict } = await getI18n();
  return (
    <>
      <PageHeader title={dict.notifications.title} description={dict.notifications.subtitle} />
      <div className="mt-8">
        <Suspense fallback={<Skeleton className="h-72 rounded-[var(--radius-card)]" />}>
          <Notifications searchParams={searchParams} locale={locale} dict={dict} />
        </Suspense>
      </div>
    </>
  );
}

async function Notifications({ searchParams, locale, dict }: { searchParams: PageProps<"/[lang]/account/notifications">["searchParams"]; locale: Locale; dict: Dictionary }) {
  await requireUser(locale, "/account/notifications");
  const sp = await searchParams;
  const unread = param(sp.unread) === "1";
  const page = pageParam(sp.page);
  return (
    <FeatureGate feature="notifications" dict={dict} load={() => listNotifications(unread, page)} example={examples.notifications}>
      {(data) => <NotificationList data={data} unread={unread} locale={locale} dict={dict} />}
    </FeatureGate>
  );
}

function NotificationList({ data, unread, locale, dict }: { data: Paginated<AppNotification>; unread: boolean; locale: Locale; dict: Dictionary }) {
  const t = dict.notifications;
  const base = `/${locale}/account/notifications`;
  const hasUnread = data.data.some((n) => !n.read_at);
  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Link href={unread ? base : `${base}?unread=1`} aria-pressed={unread} className={cn("inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ring-1 ring-inset", unread ? "bg-ink-700 text-white ring-ink-700" : "ring-line-strong hover:bg-surface-2")}>
          <BellDot className="size-4" aria-hidden />
          {t.unreadOnly}
        </Link>
        {hasUnread ? (
          <ActionButton action={markAllNotificationsReadAction} variant="ghost" size="sm" icon={<CheckCheck className="size-4" aria-hidden />}>
            {t.markAll}
          </ActionButton>
        ) : null}
      </div>
      {!data.data.length ? (
        <EmptyState icon={<Bell className="size-6" aria-hidden />} title={t.empty} />
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-[var(--radius-card)] bg-surface shadow-soft ring-1 ring-line">
          {data.data.map((n) => {
            const Icon = icons[n.type] ?? Bell;
            return (
              <li key={n.id} className={cn("flex items-start gap-4 p-4 sm:p-5", !n.read_at && "bg-saffron-50/60")}>
                <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", n.read_at ? "bg-surface-2 text-muted" : "bg-saffron-300 text-ink-900")}>
                  <Icon className="size-5" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className={cn("text-ink-900", !n.read_at && "font-bold")}>{n.data.title}</p>
                  <p className="mt-0.5 text-sm text-muted">{n.data.body}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-subtle">
                    <span>{formatDate(n.created_at, locale)}</span>
                    {n.data.url ? (
                      <Link href={`/${locale}${n.data.url}`} className="font-semibold text-ink-700 hover:underline">
                        {t.open}
                      </Link>
                    ) : null}
                  </div>
                </div>
                {!n.read_at ? <ActionButton action={markNotificationReadAction.bind(null, n.id)} variant="ghost" size="icon" ariaLabel={t.markRead} icon={<CheckCheck className="size-4" aria-hidden />} /> : null}
              </li>
            );
          })}
        </ul>
      )}
      <Pagination meta={data} basePath={base} query={{ unread: unread ? "1" : undefined }} locale={locale} dict={dict} />
    </>
  );
}
