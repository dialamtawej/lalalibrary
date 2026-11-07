import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

const control =
  "block w-full rounded-xl bg-surface px-4 text-fg ring-1 ring-inset ring-line-strong placeholder:text-subtle transition-shadow focus:outline-none focus:ring-2 focus:ring-ink-500 aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-danger disabled:bg-surface-2 disabled:text-muted";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(control, "h-12 text-base", className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(control, "min-h-32 py-3 text-base leading-relaxed", className)} {...props} />;
}

export function Select({ className, children, ...props }: ComponentProps<"select">) {
  return (
    <select className={cn(control, "h-12 cursor-pointer appearance-none bg-no-repeat pe-10 text-base", "select-chevron", className)} {...props}>
      {children}
    </select>
  );
}

type FieldProps = {
  label: ReactNode;
  htmlFor: string;
  hint?: ReactNode;
  error?: string;
  optionalLabel?: string;
  children: ReactNode;
  className?: string;
};

/** غلاف موحّد: عنوان الحقل + الحقل + تلميح + رسالة الخطأ (مرتبطة بـ aria) */
export function Field({ label, htmlFor, hint, error, optionalLabel, children, className }: FieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <label htmlFor={htmlFor} className="flex items-baseline gap-2 text-sm font-semibold text-ink-900">
        {label}
        {optionalLabel ? <span className="text-xs font-normal text-subtle">({optionalLabel})</span> : null}
      </label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={`${htmlFor}-hint`} className="text-sm text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/** خصائص aria لربط الحقل برسالة الخطأ أو التلميح */
export function fieldAria(id: string, error?: string, hasHint?: boolean) {
  return {
    id,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? `${id}-error` : hasHint ? `${id}-hint` : undefined,
  } as const;
}
