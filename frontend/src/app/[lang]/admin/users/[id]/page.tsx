import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getI18n } from "@/lib/i18n/server";
import { format, localeMeta, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/ar";
import type { Role, UserDetails } from "@/lib/api/types";
import { isApiError } from "@/lib/api/errors";
import { getCurrentUser, isBanned } from "@/lib/auth/dal";
import { getUser, listRoles } from "@/lib/services/users";
import { RoleBadges, UserStatusBadge } from "@/components/admin/user-status";
import { BanPanel, DeleteUserPanel, ResetPasswordPanel, RolesPanel, UserInfoPanel } from "@/components/admin/user-panels";
import { Alert } from "@/components/ui/alert";
import { Avatar, Skeleton } from "@/components/ui/misc";
import { LoadError } from "@/components/ui/load-error";
import { formatDate } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.admin.users.details };
}

export default async function AdminUserPage({ params }: PageProps<"/[lang]/admin/users/[id]">) {
  const { locale, dict } = await getI18n();
  const Back = localeMeta[locale].dir === "rtl" ? ArrowRight : ArrowLeft;
  return (
    <div className="space-y-6">
      <Link href={`/${locale}/admin/users`} className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-ink-800">
        <Back className="size-4" aria-hidden />
        {dict.admin.users.title}
      </Link>
      <Suspense fallback={<Skeleton className="h-[40rem] rounded-[var(--radius-card)]" />}>
        <UserDetailsView params={params} locale={locale} dict={dict} />
      </Suspense>
    </div>
  );
}

async function UserDetailsView({ params, locale, dict }: { params: PageProps<"/[lang]/admin/users/[id]">["params"]; locale: Locale; dict: Dictionary }) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();

  let user: UserDetails;
  let roles: Role[];
  try {
    [user, roles] = await Promise.all([getUser(id), listRoles()]);
  } catch (error) {
    if (isApiError(error) && error.isNotFound) notFound();
    return <LoadError error={error} dict={dict} title={dict.errors.generic} />;
  }

  const me = await getCurrentUser();
  const isSelf = me?.id === user.id;
  const t = dict.admin.users;
  const joined = formatDate(user.created_at, locale);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-5 rounded-[var(--radius-card)] bg-surface p-6 shadow-soft ring-1 ring-line sm:flex-row sm:items-center">
        <Avatar name={user.name} src={user.image_url} size="lg" />
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-2xl font-bold text-ink-900 sm:text-3xl">{user.name}</h1>
          <p className="text-sm text-muted">
            <span dir="ltr">{user.email}</span>
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <UserStatusBadge user={user} locale={locale} dict={dict} />
            <RoleBadges user={user} />
            {joined ? <span className="text-xs text-subtle">· {format(dict.profile.memberSince, { date: joined })}</span> : null}
          </div>
        </div>
      </header>

      {isSelf ? <Alert tone="info">{t.selfNote}</Alert> : null}

      <div className="grid gap-6 xl:grid-cols-2">
        <UserInfoPanel user={user} />
        <RolesPanel user={user} roles={roles} isSelf={isSelf} />
        {!isSelf ? <BanPanel user={user} banned={isBanned(user)} /> : null}
        <ResetPasswordPanel user={user} />
      </div>

      {!isSelf ? <DeleteUserPanel user={user} /> : null}
    </div>
  );
}
