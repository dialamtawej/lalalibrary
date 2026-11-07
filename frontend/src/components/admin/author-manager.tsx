"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import type { Author } from "@/lib/api/types";
import { deleteAuthorAction, saveAuthorAction } from "@/actions/admin-features";
import { useI18n } from "@/lib/i18n/client";
import { format } from "@/lib/i18n/config";
import { ActionForm, FormMessage, SubmitButton, useFieldError } from "@/components/ui/action-form";
import { Button } from "@/components/ui/button";
import { ConfirmAction } from "@/components/ui/confirm-action";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input, Textarea, fieldAria } from "@/components/ui/field";
import { FileInput } from "@/components/ui/file-input";
import { Avatar } from "@/components/ui/misc";

/** قائمة المؤلفين مع إضافة/تعديل/حذف. أزرار الكتابة تظهر فقط إذا كانت خدمة الأدمن (§2) متاحة. */
export function AuthorManager({ authors, canEdit }: { authors: Author[]; canEdit: boolean }) {
  const { dict } = useI18n();
  const t = dict.adminAuthors;
  const [editing, setEditing] = useState<{ author?: Author } | null>(null);

  return (
    <div className="space-y-4">
      {canEdit ? (
        <div className="flex justify-end">
          <Button variant="accent" icon={<Plus className="size-4" aria-hidden />} onClick={() => setEditing({})}>
            {t.add}
          </Button>
        </div>
      ) : null}
      <ul className="grid gap-3 md:grid-cols-2">
        {authors.map((a) => (
          <li key={a.id} className="flex items-center gap-4 rounded-[var(--radius-card)] bg-surface p-4 shadow-soft ring-1 ring-line">
            <Avatar name={a.name} src={a.image_url} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-ink-900">{a.name}</p>
              <p className="text-sm text-muted">{format(dict.authors.booksCount, { count: a.books_count })}</p>
            </div>
            {canEdit ? (
              <div className="flex gap-1.5">
                <Button variant="secondary" size="icon" onClick={() => setEditing({ author: a })} aria-label={`${dict.common.edit}: ${a.name}`}>
                  <Pencil className="size-4" aria-hidden />
                </Button>
                {a.books_count === 0 ? (
                  <ConfirmAction
                    action={deleteAuthorAction.bind(null, a.id)}
                    title={t.deleteTitle}
                    description={format(t.deleteBody, { name: a.name })}
                    confirmLabel={dict.common.delete}
                    trigger={<span className="sr-only">{`${dict.common.delete}: ${a.name}`}</span>}
                    triggerIcon={<Trash2 className="size-4" aria-hidden />}
                    triggerSize="icon"
                  />
                ) : null}
              </div>
            ) : null}
          </li>
        ))}
      </ul>
      <Dialog open={editing !== null} onClose={() => setEditing(null)} title={editing?.author ? t.editTitle : t.newTitle}>
        {editing ? <AuthorForm key={editing.author?.id ?? "new"} author={editing.author} onDone={() => setEditing(null)} /> : null}
      </Dialog>
    </div>
  );
}

function AuthorForm({ author, onDone }: { author?: Author; onDone: () => void }) {
  const { dict } = useI18n();
  return (
    <ActionForm action={saveAuthorAction.bind(null, author?.id ?? null)} onSuccess={onDone} className="space-y-4">
      <FormMessage />
      <Fields author={author} />
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onDone}>
          {dict.common.cancel}
        </Button>
        <SubmitButton pendingLabel={dict.common.saving}>{dict.common.save}</SubmitButton>
      </div>
    </ActionForm>
  );
}

function Fields({ author }: { author?: Author }) {
  const { dict } = useI18n();
  const t = dict.adminAuthors;
  const nameError = useFieldError("name");
  const bioError = useFieldError("biography");
  const imageError = useFieldError("image");
  return (
    <>
      <Field label={t.name} htmlFor="author-name" error={nameError}>
        <Input {...fieldAria("author-name", nameError)} name="name" defaultValue={author?.name} required maxLength={150} />
      </Field>
      <Field label={t.biography} htmlFor="author-bio" error={bioError} optionalLabel={dict.common.optional}>
        <Textarea {...fieldAria("author-bio", bioError)} name="biography" defaultValue={author?.biography ?? ""} rows={4} className="min-h-28" />
      </Field>
      <Field label={t.image} htmlFor="author-image" error={imageError} optionalLabel={dict.common.optional}>
        <FileInput id="author-image" name="image" accept="image/jpeg,image/png" label={t.image} currentUrl={author?.image_url} invalid={!!imageError} />
      </Field>
    </>
  );
}
