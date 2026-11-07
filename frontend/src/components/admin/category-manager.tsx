"use client";

import { useState } from "react";
import { Pencil, Plus, Shapes, Trash2 } from "lucide-react";
import type { Category } from "@/lib/api/types";
import { deleteCategoryAction, saveCategoryAction } from "@/actions/admin-catalog";
import { useI18n } from "@/lib/i18n/client";
import { format } from "@/lib/i18n/config";
import { ActionForm, FormMessage, SubmitButton, useFieldError } from "@/components/ui/action-form";
import { Button } from "@/components/ui/button";
import { ConfirmAction } from "@/components/ui/confirm-action";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input, Select, Textarea, fieldAria } from "@/components/ui/field";
import { Badge, EmptyState, PageHeader } from "@/components/ui/misc";
import { formatNumber } from "@/lib/utils";

type Editing = { mode: "create" } | { mode: "edit"; category: Category } | null;

export function CategoryManager({ categories, startCreating }: { categories: Category[]; startCreating?: boolean }) {
  const { locale, dict } = useI18n();
  const t = dict.admin.categories;
  const [editing, setEditing] = useState<Editing>(startCreating ? { mode: "create" } : null);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t.title}
        actions={
          <Button variant="accent" icon={<Plus className="size-4" aria-hidden />} onClick={() => setEditing({ mode: "create" })}>
            {t.add}
          </Button>
        }
      />

      {categories.length === 0 ? (
        <EmptyState icon={<Shapes className="size-6" aria-hidden />} title={t.empty} />
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {categories.map((c) => (
            <li key={c.id} className="flex items-start gap-4 rounded-[var(--radius-card)] bg-surface p-5 shadow-soft ring-1 ring-line">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-display text-xl font-bold text-ink-900">{c.name}</p>
                  <Badge tone={c.status === "active" ? "success" : "neutral"}>{t.status[c.status]}</Badge>
                </div>
                <p className="mt-1 text-xs text-subtle">
                  <span dir="ltr">/{c.slug}</span>
                </p>
                {c.parent ? <p className="mt-1 text-sm text-muted">↳ {c.parent.name}</p> : null}
                {c.description ? <p className="mt-2 line-clamp-2 text-sm text-muted">{c.description}</p> : null}
                <p className="mt-3 text-sm font-semibold text-ink-700">{format(dict.categories.booksCount, { count: formatNumber(c.books_count ?? 0, locale) })}</p>
              </div>
              <div className="flex shrink-0 gap-1.5">
                <Button variant="secondary" size="icon" onClick={() => setEditing({ mode: "edit", category: c })} aria-label={`${dict.common.edit}: ${c.name}`}>
                  <Pencil className="size-4" aria-hidden />
                </Button>
                {(c.books_count ?? 0) === 0 ? (
                  <ConfirmAction
                    action={deleteCategoryAction.bind(null, c.id)}
                    title={t.deleteTitle}
                    description={format(t.deleteBody, { name: c.name })}
                    confirmLabel={dict.common.delete}
                    trigger={<span className="sr-only">{`${dict.common.delete}: ${c.name}`}</span>}
                    triggerIcon={<Trash2 className="size-4" aria-hidden />}
                    triggerSize="icon"
                  />
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={editing !== null} onClose={() => setEditing(null)} title={editing?.mode === "edit" ? t.editTitle : t.newTitle}>
        {editing ? (
          <CategoryForm
            key={editing.mode === "edit" ? editing.category.id : "new"}
            category={editing.mode === "edit" ? editing.category : undefined}
            categories={categories}
            onDone={() => setEditing(null)}
          />
        ) : null}
      </Dialog>
    </div>
  );
}

function CategoryForm({ category, categories, onDone }: { category?: Category; categories: Category[]; onDone: () => void }) {
  const { dict } = useI18n();
  return (
    <ActionForm action={saveCategoryAction.bind(null, category?.id ?? null)} onSuccess={onDone} className="space-y-4">
      <FormMessage />
      <Fields category={category} categories={categories} />
      <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onDone}>
          {dict.common.cancel}
        </Button>
        <SubmitButton pendingLabel={dict.common.saving}>{dict.common.save}</SubmitButton>
      </div>
    </ActionForm>
  );
}

function Fields({ category, categories }: { category?: Category; categories: Category[] }) {
  const { dict } = useI18n();
  const t = dict.admin.categories.fields;
  const nameError = useFieldError("name");
  const slugError = useFieldError("slug");
  const descError = useFieldError("description");
  const parentError = useFieldError("parent_id");
  const parents = categories.filter((c) => c.id !== category?.id);

  return (
    <>
      <Field label={t.name} htmlFor="cat-name" error={nameError}>
        <Input {...fieldAria("cat-name", nameError)} name="name" defaultValue={category?.name} required maxLength={100} />
      </Field>
      <Field label={t.slug} htmlFor="cat-slug" hint={t.slugHint} error={slugError} optionalLabel={category ? undefined : dict.common.optional}>
        <Input {...fieldAria("cat-slug", slugError, true)} name="slug" defaultValue={category?.slug} dir="ltr" pattern="[A-Za-z0-9_\-]+" maxLength={100} required={!!category} />
      </Field>
      <Field label={t.description} htmlFor="cat-desc" error={descError} optionalLabel={dict.common.optional}>
        <Textarea {...fieldAria("cat-desc", descError)} name="description" defaultValue={category?.description ?? ""} rows={3} maxLength={1000} className="min-h-24" />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t.status} htmlFor="cat-status">
          <Select id="cat-status" name="status" defaultValue={category?.status ?? "active"}>
            <option value="active">{dict.admin.categories.status.active}</option>
            <option value="inactive">{dict.admin.categories.status.inactive}</option>
          </Select>
        </Field>
        <Field label={t.parent} htmlFor="cat-parent" error={parentError}>
          <Select {...fieldAria("cat-parent", parentError)} name="parent_id" defaultValue={category?.parent_id ?? ""}>
            <option value="">{t.noParent}</option>
            {parents.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>
      </div>
    </>
  );
}
