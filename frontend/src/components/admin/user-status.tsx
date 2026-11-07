import type { User } from "@/lib/api/types";
import { format, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/ar";
import { isBanned } from "@/lib/auth/dal";
import { Badge } from "@/components/ui/misc";
import { formatDate } from "@/lib/utils";

export function UserStatusBadge({ user, locale, dict }: { user: User; locale: Locale; dict: Dictionary }) {
  const t = dict.admin.users.status;
  if (!isBanned(user)) return <Badge tone="success">{t.active}</Badge>;
  const until = formatDate(user.ban_info?.ban_until, locale);
  return <Badge tone="danger">{until ? format(t.bannedUntil, { date: until }) : t.banned}</Badge>;
}

export function RoleBadges({ user }: { user: User }) {
  return (
    <div className="flex flex-wrap gap-1">
      {(user.roles ?? []).map((r) => (
        <Badge key={r.id} tone={r.code === "admin" ? "saffron" : "ink"}>
          {r.name}
        </Badge>
      ))}
    </div>
  );
}
