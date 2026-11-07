"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { useI18n } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";

/**
 * نافذة حوار مبنية على عنصر <dialog> الأصلي:
 * يحبس التركيز، يُغلق بزر Esc، ويعمل مع قارئات الشاشة بدون مكتبات.
 * على الموبايل تظهر كـ Bottom Sheet.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const { dict } = useI18n();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      aria-labelledby="dialog-title"
      className={cn(
        "m-0 mt-auto w-full max-w-none rounded-t-3xl bg-surface p-0 text-fg shadow-lift backdrop:bg-ink-900/40 backdrop:backdrop-blur-[2px]",
        "sm:m-auto sm:max-w-lg sm:rounded-3xl",
        className,
      )}
    >
      {open ? (
        <div className="p-6">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h2 id="dialog-title" className="text-lg font-bold text-ink-900">
                {title}
              </h2>
              {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
            </div>
            <button type="button" onClick={onClose} className="grid size-9 shrink-0 place-items-center rounded-full text-muted hover:bg-surface-2" aria-label={dict.common.close}>
              <X className="size-5" aria-hidden />
            </button>
          </div>
          {children}
        </div>
      ) : null}
    </dialog>
  );
}
