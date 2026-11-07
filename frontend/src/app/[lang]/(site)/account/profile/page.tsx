import { Suspense } from "react";
import type { Metadata } from "next";
import { getI18n } from "@/lib/i18n/server";
import { format, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/ar";
import { requireUser } from "@/lib/auth/dal";
import { ProfileForm } from "@/components/account/profile-form";
import { Avatar, Badge, PageHeader, PendingFeature, Skeleton } from "@/components/ui/misc";
import { formatDate } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.profile.title, robots: { index: false } };
}

export default async function ProfilePage() {
  const { locale, dict } = await getI18n();
  return (
    <div>
      <PageHeader title={dict.profile.title} description={dict.profile.subtitle} />
      <Suspense fallback={<ProfileSkeleton />}>
        <ProfileContent locale={locale} dict={dict} />
      </Suspense>
    </div>
  );
}

async function ProfileContent({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const user = await requireUser(locale, "/account/profile");
  const since = formatDate(user.created_at, locale);

  return (
    <div className="mt-10 grid gap-8 lg:grid-cols-[18rem_1fr]">
      <aside className="space-y-6">
        <div className="flex flex-col items-center rounded-[var(--radius-card)] bg-surface p-6 text-center shadow-soft ring-1 ring-line">
          <Avatar name={user.name} src={user.image_url} size="xl" />
          <p className="mt-4 font-display text-xl font-bold text-ink-900">{user.name}</p>
          <p className="text-sm text-muted">
            <span dir="ltr">{user.email}</span>
          </p>
          {since ? <p className="mt-3 text-xs text-subtle">{format(dict.profile.memberSince, { date: since })}</p> : null}
          {user.roles?.length ? (
            <div className="mt-4 flex flex-wrap justify-center gap-1.5" aria-label={dict.profile.roles}>
              {user.roles.map((r) => (
                <Badge key={r.id} tone={r.code === "admin" ? "saffron" : "ink"}>
                  {r.name}
                </Badge>
              ))}
            </div>
          ) : null}
        </div>
        <PendingFeature
          badge={dict.pending.badge}
          title={dict.profile.comingTitle}
          items={[dict.profile.comingContact]}
        />
      </aside>
      <ProfileForm name={user.name} imageUrl={user.image_url} />
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="mt-10 grid gap-8 lg:grid-cols-[18rem_1fr]" aria-hidden>
      <Skeleton className="h-72 rounded-[var(--radius-card)]" />
      <Skeleton className="h-96 rounded-[var(--radius-card)]" />
    </div>
  );
}
