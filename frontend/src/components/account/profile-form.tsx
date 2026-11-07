"use client";

import { updateProfileAction } from "@/actions/profile";
import { useI18n } from "@/lib/i18n/client";
import { ActionForm, FormMessage, SubmitButton, useFieldError } from "@/components/ui/action-form";
import { Field, Input, fieldAria } from "@/components/ui/field";
import { FileInput } from "@/components/ui/file-input";
import { Card, CardTitle } from "@/components/ui/misc";

export function ProfileForm({ name, imageUrl }: { name: string; imageUrl: string | null }) {
  const { dict } = useI18n();
  return (
    <ActionForm action={updateProfileAction} resetOnSuccess className="space-y-6">
      <FormMessage />
      <Card>
        <CardTitle>{dict.profile.infoSection}</CardTitle>
        <div className="space-y-5">
          <NameInput defaultValue={name} />
          <ImageInput currentUrl={imageUrl} />
        </div>
      </Card>
      <Card>
        <CardTitle description={dict.profile.passwordSectionHint}>{dict.profile.passwordSection}</CardTitle>
        <PasswordFields />
      </Card>
      <div className="flex justify-end">
        <SubmitButton size="lg" pendingLabel={dict.common.saving}>
          {dict.common.save}
        </SubmitButton>
      </div>
    </ActionForm>
  );
}

function NameInput({ defaultValue }: { defaultValue: string }) {
  const { dict } = useI18n();
  const error = useFieldError("name");
  return (
    <Field label={dict.auth.name} htmlFor="name" error={error}>
      {/* key يعيد ضبط القيمة الافتراضية بعد الحفظ */}
      <Input key={defaultValue} {...fieldAria("name", error)} name="name" defaultValue={defaultValue} required maxLength={100} autoComplete="name" />
    </Field>
  );
}

function ImageInput({ currentUrl }: { currentUrl: string | null }) {
  const { dict } = useI18n();
  const error = useFieldError("image");
  return (
    <Field label={dict.profile.image} htmlFor="image" hint={dict.profile.imageHint} error={error}>
      <FileInput
        id="image"
        name="image"
        accept="image/jpeg,image/png,image/gif"
        label={dict.profile.chooseImage}
        currentUrl={currentUrl}
        invalid={!!error}
        describedBy={error ? "image-error" : "image-hint"}
      />
    </Field>
  );
}

function PasswordFields() {
  const { dict } = useI18n();
  const oldError = useFieldError("old_password");
  const newError = useFieldError("password");
  const confirmError = useFieldError("password_confirmation");
  return (
    <div className="grid gap-5 sm:grid-cols-3">
      <Field label={dict.profile.oldPassword} htmlFor="old_password" error={oldError}>
        <Input {...fieldAria("old_password", oldError)} name="old_password" type="password" autoComplete="current-password" dir="ltr" />
      </Field>
      <Field label={dict.profile.newPassword} htmlFor="password" error={newError} hint={dict.auth.passwordHint}>
        <Input {...fieldAria("password", newError, true)} name="password" type="password" autoComplete="new-password" minLength={8} dir="ltr" />
      </Field>
      <Field label={dict.profile.confirmPassword} htmlFor="password_confirmation" error={confirmError}>
        <Input {...fieldAria("password_confirmation", confirmError)} name="password_confirmation" type="password" autoComplete="new-password" dir="ltr" />
      </Field>
    </div>
  );
}
