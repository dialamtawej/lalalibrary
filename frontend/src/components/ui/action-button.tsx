"use client";

import type { ReactNode } from "react";
import type { ActionState } from "@/lib/actions/types";
import { ActionForm, useFormState } from "./action-form";
import { Button, type ButtonSize, type ButtonVariant } from "./button";

type FormAction = (state: ActionState, formData: FormData) => Promise<ActionState>;

/**
 * زر واحد ينفذ Server Action (متابعة، مفضلة، تعليم كمقروء…).
 * الخطأ يظهر تحت الزر مباشرة، والنجاح يحدّث الصفحة عبر refresh() في الـ Action.
 */
export function ActionButton({
  action,
  children,
  variant = "secondary",
  size = "md",
  icon,
  className,
  ariaLabel,
  ariaPressed,
  hidden,
}: {
  action: FormAction;
  children?: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  className?: string;
  ariaLabel?: string;
  ariaPressed?: boolean;
  hidden?: Record<string, string>;
}) {
  return (
    <ActionForm action={action} className="inline-flex flex-col items-start gap-1">
      {hidden ? Object.entries(hidden).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />) : null}
      <Inner variant={variant} size={size} icon={icon} className={className} ariaLabel={ariaLabel} ariaPressed={ariaPressed}>
        {children}
      </Inner>
    </ActionForm>
  );
}

function Inner({ children, variant, size, icon, className, ariaLabel, ariaPressed }: { children?: ReactNode; variant: ButtonVariant; size: ButtonSize; icon?: ReactNode; className?: string; ariaLabel?: string; ariaPressed?: boolean }) {
  const { state, pending } = useFormState();
  return (
    <>
      <Button type="submit" variant={variant} size={size} icon={icon} loading={pending} className={className} aria-label={ariaLabel} aria-pressed={ariaPressed}>
        {children}
      </Button>
      {state.status === "error" && state.message ? (
        <span role="alert" className="max-w-64 text-xs text-danger">
          {state.message}
        </span>
      ) : null}
    </>
  );
}
