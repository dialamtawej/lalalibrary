"use client";

import { Check } from "lucide-react";
import type { Book, Category } from "@/lib/api/types";
import type { ActionState } from "@/lib/actions/types";
import { useI18n } from "@/lib/i18n/client";
import { ActionForm, FormMessage, SubmitButton, useFieldError } from "@/components/ui/action-form";
import { Field, Input, Textarea, fieldAria } from "@/components/ui/field";
import { FileInput } from "@/components/ui/file-input";
import { Card } from "@/components/ui/misc";
import { Alert } from "@/components/ui/alert";

type FormAction = (state: ActionState, formData: FormData) => Promise<ActionState>;

/** نموذج إضافة/تعديل كتاب — نفس المكوّن للحالتين */
export function BookForm({ action, categories, book }: { action: FormAction; categories: Category[]; book?: Book }) {
  const { dict } = useI18n();
  const t = dict.admin.books;
  return (
    <ActionForm action={action} className="space-y-6" encType="multipart/form-data">
      <FormMessage />
      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <Card>
          <div className="space-y-5">
            <TitleField defaultValue={book?.title} />
            <DescriptionField defaultValue={book?.description ?? ""} />
            <CategoriesField categories={categories} selected={book?.categories.map((c) => c.id) ?? []} />
          </div>
        </Card>
        <div className="space-y-6">
          <Card>
            <CoverField currentUrl={book?.cover_url} />
          </Card>
          <Card>
            <EbookField hasEbook={!!book?.has_ebook} />
          </Card>
        </div>
      </div>
      <div className="sticky bottom-0 -mx-4 flex justify-end border-t border-line bg-paper/90 px-4 py-4 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0">
        <SubmitButton size="lg" pendingLabel={dict.common.saving} className="w-full sm:w-auto">
          {book ? dict.common.save : t.add}
        </SubmitButton>
      </div>
    </ActionForm>
  );
}

function TitleField({ defaultValue }: { defaultValue?: string }) {
  const { dict } = useI18n();
  const error = useFieldError("title");
  return (
    <Field label={dict.admin.books.fields.title} htmlFor="title" error={error}>
      <Input {...fieldAria("title", error)} name="title" defaultValue={defaultValue} required maxLength={255} />
    </Field>
  );
}

function DescriptionField({ defaultValue }: { defaultValue: string }) {
  const { dict } = useI18n();
  const error = useFieldError("description");
  return (
    <Field label={dict.admin.books.fields.description} htmlFor="description" error={error} optionalLabel={dict.common.optional}>
      <Textarea {...fieldAria("description", error)} name="description" defaultValue={defaultValue} rows={8} />
    </Field>
  );
}

function CategoriesField({ categories, selected }: { categories: Category[]; selected: number[] }) {
  const { dict } = useI18n();
  const t = dict.admin.books.fields;
  const error = useFieldError("categories");
  if (!categories.length) return <Alert tone="warning">{t.noCategories}</Alert>;
  return (
    <fieldset aria-describedby={error ? "categories-error" : "categories-hint"}>
      <legend className="mb-2 text-sm font-semibold text-ink-900">{t.categories}</legend>
      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <label key={c.id} className="cursor-pointer">
            <input type="checkbox" name="categories" value={c.id} defaultChecked={selected.includes(c.id)} className="peer sr-only" />
            <span className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-ink-800 ring-1 ring-inset ring-line-strong transition-colors hover:bg-surface-2 peer-checked:bg-ink-700 peer-checked:text-white peer-checked:ring-ink-700 peer-focus-visible:outline peer-focus-visible:outline-3 peer-focus-visible:outline-saffron-400 [&>svg]:hidden peer-checked:[&>svg]:block">
              <Check className="size-3.5" aria-hidden />
              {c.name}
              {c.status === "inactive" ? <span className="text-xs opacity-70">({dict.admin.categories.status.inactive})</span> : null}
            </span>
          </label>
        ))}
      </div>
      {error ? (
        <p id="categories-error" role="alert" className="mt-2 text-sm text-danger">
          {error}
        </p>
      ) : (
        <p id="categories-hint" className="mt-2 text-sm text-muted">
          {t.categoriesHint}
        </p>
      )}
    </fieldset>
  );
}

function CoverField({ currentUrl }: { currentUrl?: string | null }) {
  const { dict } = useI18n();
  const t = dict.admin.books.fields;
  const error = useFieldError("cover_image");
  return (
    <Field label={t.cover} htmlFor="cover_image" hint={t.coverHint} error={error}>
      <FileInput id="cover_image" name="cover_image" accept="image/jpeg,image/png" label={t.cover} currentUrl={currentUrl} invalid={!!error} describedBy={error ? "cover_image-error" : "cover_image-hint"} />
    </Field>
  );
}

function EbookField({ hasEbook }: { hasEbook: boolean }) {
  const { dict } = useI18n();
  const t = dict.admin.books.fields;
  const error = useFieldError("file");
  return (
    <Field label={t.file} htmlFor="file" hint={hasEbook ? t.currentFile : t.fileHint} error={error}>
      <FileInput id="file" name="file" accept="application/pdf" kind="document" label={t.file} invalid={!!error} describedBy={error ? "file-error" : "file-hint"} />
    </Field>
  );
}
