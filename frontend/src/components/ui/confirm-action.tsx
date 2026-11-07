"use client";

import { useState, type ReactNode } from "react";
import { useI18n } from "@/lib/i18n/client";
import type { ActionState } from "@/lib/actions/types";
import { ActionForm, FormMessage, SubmitButton } from "./action-form";
import { Button, type ButtonSize, type ButtonVariant } from "./button";
import { Dialog } from "./dialog";

type FormAction = (state: ActionState, formData: FormData) => Promise<ActionState>;

/**
 * زر لعملية حساسة (حذف…) يفتح نافذة تأكيد، ثم ينفذ الـ Server Action.
 * الخطأ (إن وُجد) يظهر داخل النافذة نفسها.
 */
export function ConfirmAction({
  action,
  title,
  description,
  confirmLabel,
  trigger,
  triggerVariant = "danger-soft",
  triggerSize = "sm",
  triggerIcon,
  triggerAriaLabel,
  hiddenFields,
}: {
  action: FormAction;
  title: ReactNode;
  description?: ReactNode;
  confirmLabel: string;
  trigger: ReactNode;
  triggerVariant?: ButtonVariant;
  triggerSize?: ButtonSize;
  triggerIcon?: ReactNode;
  triggerAriaLabel?: string;
  hiddenFields?: Record<string, string>;
}) {
  const [open, setOpen] = useState(false);
  const { dict } = useI18n();

  return (
    <>
      <Button variant={triggerVariant} size={triggerSize} icon={triggerIcon} onClick={() => setOpen(true)} aria-label={triggerAriaLabel}>
        {trigger}
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} title={title} description={description}>
        <ActionForm action={action} onSuccess={() => setOpen(false)} className="space-y-4">
          {hiddenFields ? Object.entries(hiddenFields).map(([name, value]) => <input key={name} type="hidden" name={name} value={value} />) : null}
          <FormMessage />
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={() => setOpen(false)}>
              {dict.common.cancel}
            </Button>
            <SubmitButton variant="danger">{confirmLabel}</SubmitButton>
          </div>
        </ActionForm>
      </Dialog>
    </>
  );
}
