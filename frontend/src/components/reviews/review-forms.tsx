"use client";

import { useState } from "react";
import { Flag, Pencil, Trash2 } from "lucide-react";
import type { Review } from "@/lib/api/types";
import { deleteReviewAction, reportReviewAction, saveReviewAction } from "@/actions/features";
import { useI18n } from "@/lib/i18n/client";
import { format } from "@/lib/i18n/config";
import { ActionForm, FormMessage, SubmitButton, useFieldError } from "@/components/ui/action-form";
import { Button } from "@/components/ui/button";
import { ConfirmAction } from "@/components/ui/confirm-action";
import { Dialog } from "@/components/ui/dialog";
import { Field, Select, Textarea } from "@/components/ui/field";
import { StarInput } from "./stars";

/** نموذج كتابة/تعديل مراجعة (مراجعة واحدة لكل مستخدم لكل كتاب) */
export function ReviewForm({ slug, existing }: { slug: string; existing?: Review | null }) {
  const { dict } = useI18n();
  const [editing, setEditing] = useState(!existing);

  if (existing && !editing) {
    return (
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" size="sm" icon={<Pencil className="size-4" aria-hidden />} onClick={() => setEditing(true)}>
          {dict.common.edit}
        </Button>
        <ConfirmAction
          action={deleteReviewAction.bind(null, existing.id)}
          title={dict.reviews.deleteTitle}
          description={dict.reviews.deleteBody}
          confirmLabel={dict.common.delete}
          trigger={dict.common.delete}
          triggerIcon={<Trash2 className="size-4" aria-hidden />}
        />
      </div>
    );
  }

  return (
    <ActionForm action={saveReviewAction.bind(null, slug, existing?.id ?? null)} onSuccess={() => existing && setEditing(false)} className="space-y-4 rounded-2xl bg-surface-2/60 p-5">
      <FormMessage />
      <RatingField defaultValue={existing?.rating} />
      <Field label={dict.reviews.body} htmlFor="review-body" optionalLabel={dict.common.optional}>
        <Textarea id="review-body" name="body" defaultValue={existing?.body ?? ""} placeholder={dict.reviews.bodyPlaceholder} maxLength={3000} rows={4} className="min-h-28" />
      </Field>
      <div className="flex gap-2">
        <SubmitButton pendingLabel={dict.common.saving}>{existing ? dict.reviews.update : dict.reviews.submit}</SubmitButton>
        {existing ? (
          <Button variant="ghost" onClick={() => setEditing(false)}>
            {dict.common.cancel}
          </Button>
        ) : null}
      </div>
    </ActionForm>
  );
}

function RatingField({ defaultValue }: { defaultValue?: number }) {
  const { dict } = useI18n();
  const error = useFieldError("rating");
  return (
    <div>
      <StarInput name="rating" defaultValue={defaultValue} legend={dict.reviews.rating} labels={(n) => format(dict.reviews.outOf, { rating: n })} invalid={!!error} />
      {error ? (
        <p role="alert" className="mt-1 text-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

const REASONS = ["spam", "offensive", "spoiler", "other"] as const;

/** زر الإبلاغ عن مراجعة مع نافذة لاختيار السبب */
export function ReportReviewButton({ reviewId }: { reviewId: number }) {
  const { dict } = useI18n();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold text-muted hover:bg-surface-2 hover:text-ink-800">
        <Flag className="size-3.5" aria-hidden />
        {dict.reviews.report}
      </button>
      <Dialog open={open} onClose={() => setOpen(false)} title={dict.reviews.reportTitle}>
        <ActionForm action={reportReviewAction.bind(null, reviewId)} onSuccess={() => setTimeout(() => setOpen(false), 1200)} className="space-y-4">
          <FormMessage />
          <Field label={dict.reviews.reportReason} htmlFor="report-reason">
            <Select id="report-reason" name="reason" defaultValue="spam">
              {REASONS.map((r) => (
                <option key={r} value={r}>
                  {dict.reviews.reasons[r]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={dict.reviews.reportNote} htmlFor="report-note" optionalLabel={dict.common.optional}>
            <Textarea id="report-note" name="note" rows={3} maxLength={500} className="min-h-20" />
          </Field>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>
              {dict.common.cancel}
            </Button>
            <SubmitButton variant="danger-soft">{dict.reviews.reportSend}</SubmitButton>
          </div>
        </ActionForm>
      </Dialog>
    </>
  );
}
