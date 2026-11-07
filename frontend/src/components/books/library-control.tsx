"use client";

import { Heart, Library } from "lucide-react";
import type { LibraryStatus } from "@/lib/api/types";
import { setLibraryStatusAction, toggleFavoriteAction } from "@/actions/features";
import { useI18n } from "@/lib/i18n/client";
import { ActionForm, useFormState } from "@/components/ui/action-form";
import { ActionButton } from "@/components/ui/action-button";
import { Select } from "@/components/ui/field";
import { cn } from "@/lib/utils";

/** اختيار رف الكتاب في مكتبة المستخدم (§4). يُرسل فور التغيير. */
export function LibraryControl({ bookId, status }: { bookId: number; status: LibraryStatus | null }) {
  return (
    <ActionForm action={setLibraryStatusAction.bind(null, bookId)} className="flex flex-col gap-1">
      <LibrarySelect status={status} />
    </ActionForm>
  );
}

function LibrarySelect({ status }: { status: LibraryStatus | null }) {
  const { dict } = useI18n();
  const { state, pending } = useFormState();
  const t = dict.library;
  return (
    <>
      <label htmlFor="library-status" className="sr-only">
        {t.statusLabel}
      </label>
      <div className="relative">
        <Library className="pointer-events-none absolute start-4 top-1/2 size-4 -translate-y-1/2 text-ink-700" aria-hidden />
        <Select
          id="library-status"
          name="status"
          key={status ?? "none"}
          defaultValue={status ?? ""}
          disabled={pending}
          onChange={(e) => e.currentTarget.form?.requestSubmit()}
          className={cn("h-11 rounded-full ps-10 font-semibold", status ? "bg-ink-50 text-ink-800 ring-ink-200" : "")}
        >
          <option value="" disabled>
            {t.addTo}
          </option>
          <option value="want_to_read">{t.tabs.want_to_read}</option>
          <option value="reading">{t.tabs.reading}</option>
          <option value="finished">{t.tabs.finished}</option>
          {status ? <option value="remove">{t.remove}</option> : null}
        </Select>
      </div>
      {state.status === "error" && state.message ? (
        <span role="alert" className="text-xs text-danger">
          {state.message}
        </span>
      ) : null}
    </>
  );
}

export function FavoriteToggle({ bookId, isFavorite }: { bookId: number; isFavorite: boolean }) {
  const { dict } = useI18n();
  const label = isFavorite ? dict.favorites.remove : dict.favorites.add;
  return (
    <ActionButton
      action={toggleFavoriteAction.bind(null, bookId, !isFavorite)}
      variant={isFavorite ? "danger-soft" : "secondary"}
      size="icon"
      ariaLabel={label}
      ariaPressed={isFavorite}
      icon={<Heart className={cn("size-5", isFavorite && "fill-current")} aria-hidden />}
    />
  );
}
