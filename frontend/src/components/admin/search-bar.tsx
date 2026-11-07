import type { ReactNode } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/field";

/** نموذج بحث GET بسيط لصفحات لوحة التحكم (يعمل بدون JavaScript) */
export function AdminSearchBar({ action, defaultValue, placeholder, label, submitLabel, children }: { action: string; defaultValue?: string; placeholder: string; label: string; submitLabel: string; children?: ReactNode }) {
  return (
    <form method="get" action={action} role="search" className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <label htmlFor="admin-search" className="sr-only">
          {label}
        </label>
        <Search className="pointer-events-none absolute start-4 top-1/2 size-5 -translate-y-1/2 text-subtle" aria-hidden />
        <Input id="admin-search" name="search" type="search" defaultValue={defaultValue} placeholder={placeholder} className="ps-12" />
      </div>
      {children}
      <button type="submit" className="h-12 shrink-0 rounded-full bg-ink-700 px-6 font-semibold text-white hover:bg-ink-800">
        {submitLabel}
      </button>
    </form>
  );
}
