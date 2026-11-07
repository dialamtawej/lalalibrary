import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Users } from "lucide-react";
import { getI18n } from "@/lib/i18n/server";
import { localeMeta, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/ar";
import type { UserStatusFilter } from "@/lib/api/types";
import { getCurrentUser } from "@/lib/auth/dal";
import { listUsers } from "@/lib/services/users";
import { AdminSearchBar } from "@/components/admin/search-bar";
import { RoleBadges, UserStatusBadge } from "@/components/admin/user-status";
import { AutoSubmitSelect } from "@/components/books/auto-submit-select";
import { Avatar, Badge, EmptyState, PageHeader, Skeleton } from "@/components/ui/misc";
import { Pagination } from "@/components/ui/pagination";
import { LoadError } from "@/components/ui/load-error";
import { formatDate, pageParam, param } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.admin.users.title };
}

const STATUSES: UserStatusFilter[] = ["all", "active", "banned"];

export default async function AdminUsersPage({ searchParams }: PageProps<"/[lang]/admin/users">) {
  const { locale, dict } = await getI18n();
  return (
    <div className="space-y-6">
      <PageHeader title={dict.admin.users.title} />
      <Suspense fallback={<Skeleton className="h-96 rounded-[var(--radius-card)]" />}>
        <UsersList searchParams={searchParams} locale={locale} dict={dict} />
      </Suspense>
    </div>
  );
}

async function UsersList({ searchParams, locale, dict }: { searchParams: PageProps<"/[lang]/admin/users">["searchParams"]; locale: Locale; dict: Dictionary }) {
  const sp = await searchParams;
  const search = param(sp.search)?.trim() || undefined;
  const statusRaw = param(sp.status) as UserStatusFilter | undefined;
  const status = statusRaw && STATUSES.includes(statusRaw) ? statusRaw : "all";
  const page = pageParam(sp.page);
  const t = dict.admin.users;
  const Chevron = localeMeta[locale].dir === "rtl" ? ChevronLeft : ChevronRight;

  let result;
  const me = await getCurrentUser();
  try {
    result = await listUsers({ search, status: status === "all" ? undefined : status, page, per_page: 15 });
  } catch (error) {
    return <LoadError error={error} dict={dict} title={dict.errors.generic} />;
  }

  return (
    <>
      <AdminSearchBar action={`/${locale}/admin/users`} defaultValue={search} placeholder={t.searchPlaceholder} label={dict.common.search} submitLabel={dict.common.search}>
        <div className="sm:w-44">
          <label htmlFor="user-status" className="sr-only">
            {t.columns.status}
          </label>
          <AutoSubmitSelect id="user-status" name="status" defaultValue={status}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {t.filter[s]}
              </option>
            ))}
          </AutoSubmitSelect>
        </div>
      </AdminSearchBar>

      {result.data.length === 0 ? (
        <EmptyState icon={<Users className="size-6" aria-hidden />} title={t.empty} />
      ) : (
        <div className="overflow-hidden rounded-[var(--radius-card)] bg-surface shadow-soft ring-1 ring-line">
          <table className="hidden w-full text-sm md:table">
            <thead className="bg-surface-2 text-xs font-bold uppercase tracking-wide text-muted">
              <tr>
                <th scope="col" className="px-5 py-3 text-start">{t.columns.user}</th>
                <th scope="col" className="px-5 py-3 text-start">{t.columns.roles}</th>
                <th scope="col" className="px-5 py-3 text-start">{t.columns.status}</th>
                <th scope="col" className="px-5 py-3 text-start">{t.columns.joined}</th>
                <th scope="col" className="px-5 py-3">
                  <span className="sr-only">{dict.common.actions}</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {result.data.map((u) => (
                <tr key={u.id} className="relative hover:bg-paper/60">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={u.name} src={u.image_url} size="sm" />
                      <div className="min-w-0">
                        <p className="flex items-center gap-2 font-semibold text-ink-900">
                          {u.name}
                          {me?.id === u.id ? <Badge tone="saffron">{t.you}</Badge> : null}
                        </p>
                        <p className="truncate text-xs text-muted">
                          <span dir="ltr">{u.email}</span>
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <RoleBadges user={u} />
                  </td>
                  <td className="px-5 py-3">
                    <UserStatusBadge user={u} locale={locale} dict={dict} />
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-muted">{formatDate(u.created_at, locale) ?? "—"}</td>
                  <td className="px-5 py-3 text-end">
                    <Link href={`/${locale}/admin/users/${u.id}`} className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 font-semibold text-ink-700 after:absolute after:inset-0 hover:bg-ink-50">
                      {t.details}
                      <Chevron className="size-4" aria-hidden />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <ul className="divide-y divide-line md:hidden">
            {result.data.map((u) => (
              <li key={u.id}>
                <Link href={`/${locale}/admin/users/${u.id}`} className="flex items-center gap-3 p-4 hover:bg-paper/60">
                  <Avatar name={u.name} src={u.image_url} />
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <p className="truncate font-semibold text-ink-900">{u.name}</p>
                    <p className="truncate text-xs text-muted">
                      <span dir="ltr">{u.email}</span>
                    </p>
                    <div className="flex flex-wrap gap-1">
                      <UserStatusBadge user={u} locale={locale} dict={dict} />
                      <RoleBadges user={u} />
                    </div>
                  </div>
                  <Chevron className="size-5 text-subtle" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Pagination meta={result} basePath={`/${locale}/admin/users`} query={{ search, status: status === "all" ? undefined : status }} locale={locale} dict={dict} />
    </>
  );
}
