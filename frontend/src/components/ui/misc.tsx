import type { ReactNode } from "react";
import Image from "next/image";
import { Hourglass } from "lucide-react";
import { cn, initials } from "@/lib/utils";

/* ---------- Badge ---------- */

type BadgeTone = "neutral" | "ink" | "saffron" | "plum" | "success" | "danger" | "warning";

const badgeTones: Record<BadgeTone, string> = {
  neutral: "bg-surface-2 text-muted",
  ink: "bg-ink-50 text-ink-700",
  saffron: "bg-saffron-100 text-ink-900",
  plum: "bg-plum-50 text-plum-700",
  success: "bg-success-soft text-success",
  danger: "bg-danger-soft text-danger",
  warning: "bg-warning-soft text-warning",
};

export function Badge({ tone = "neutral", children, className, icon }: { tone?: BadgeTone; children: ReactNode; className?: string; icon?: ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold leading-none", badgeTones[tone], className)}>
      {icon}
      {children}
    </span>
  );
}

/* ---------- Skeleton ---------- */

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("relative overflow-hidden rounded-xl bg-surface-2 before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.6s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent", className)} />;
}

/* ---------- Empty state ---------- */

export function EmptyState({ icon, title, description, action, className }: { icon?: ReactNode; title: ReactNode; description?: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center rounded-[var(--radius-card)] border border-dashed border-line-strong bg-surface/60 px-6 py-14 text-center", className)}>
      {icon ? <div className="mb-4 grid size-14 place-items-center rounded-2xl bg-saffron-100 text-ink-800">{icon}</div> : null}
      <p className="font-display text-xl font-bold text-ink-900">{title}</p>
      {description ? <p className="mt-2 max-w-md text-muted">{description}</p> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

/* ---------- Pending integration ---------- */

/** يوضح أن الميزة جاهزة في الواجهة وتنتظر الباك إند — بدون أزرار وهمية */
export function PendingFeature({ title, description, badge, items, className }: { title: ReactNode; description?: ReactNode; badge: string; items?: ReactNode[]; className?: string }) {
  return (
    <section className={cn("rounded-[var(--radius-card)] border border-saffron-200 bg-saffron-50/70 p-5", className)}>
      <div className="flex items-center gap-2">
        <Hourglass className="size-4 text-saffron-700" aria-hidden />
        <span className="text-xs font-bold uppercase tracking-wide text-saffron-700">{badge}</span>
      </div>
      <p className="mt-2 font-semibold text-ink-900">{title}</p>
      {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
      {items?.length ? (
        <ul className="mt-3 space-y-1.5 text-sm text-ink-800">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-saffron-500" aria-hidden />
              {item}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

/* ---------- Avatar ---------- */

export function Avatar({ name, src, size = "md", className }: { name: string; src?: string | null; size?: "sm" | "md" | "lg" | "xl"; className?: string }) {
  const dims = { sm: "size-8 text-sm", md: "size-10 text-base", lg: "size-14 text-xl", xl: "size-24 text-3xl" }[size];
  return src ? (
    <span className={cn("relative inline-block shrink-0 overflow-hidden rounded-full ring-2 ring-surface", dims, className)}>
      <Image src={src} alt="" fill sizes="96px" className="object-cover" />
    </span>
  ) : (
    <span aria-hidden className={cn("grid shrink-0 place-items-center rounded-full bg-plum-100 font-display font-bold text-plum-700 ring-2 ring-surface", dims, className)}>
      {initials(name)}
    </span>
  );
}

/* ---------- Page header ---------- */

export function PageHeader({ eyebrow, title, description, actions, className }: { eyebrow?: ReactNode; title: ReactNode; description?: ReactNode; actions?: ReactNode; className?: string }) {
  return (
    <header className={cn("flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="min-w-0">
        {eyebrow ? <p className="mb-2 text-sm font-semibold text-plum-600">{eyebrow}</p> : null}
        <h1 className="font-display text-3xl font-bold leading-tight text-ink-900 sm:text-4xl">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </header>
  );
}

/* ---------- Card ---------- */

export function Card({ children, className, as: Tag = "section" }: { children: ReactNode; className?: string; as?: "section" | "div" | "article" }) {
  return <Tag className={cn("rounded-[var(--radius-card)] bg-surface p-5 shadow-soft ring-1 ring-line sm:p-6", className)}>{children}</Tag>;
}

export function CardTitle({ children, description, className }: { children: ReactNode; description?: ReactNode; className?: string }) {
  return (
    <div className={cn("mb-5", className)}>
      <h2 className="text-lg font-bold text-ink-900">{children}</h2>
      {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
    </div>
  );
}
