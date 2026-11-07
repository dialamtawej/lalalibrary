"use client";

import { useState } from "react";
import { Ban, KeyRound, ShieldCheck, Trash2, Undo2 } from "lucide-react";
import type { Role, UserDetails } from "@/lib/api/types";
import { banUserAction, deleteUserAction, resetPasswordAction, unbanUserAction, updateRolesAction, updateUserAction } from "@/actions/admin-users";
import { useI18n } from "@/lib/i18n/client";
import { format } from "@/lib/i18n/config";
import { ActionForm, FormMessage, SubmitButton, useFieldError } from "@/components/ui/action-form";
import { ConfirmAction } from "@/components/ui/confirm-action";
import { Field, Input, fieldAria } from "@/components/ui/field";
import { Card, CardTitle } from "@/components/ui/misc";

/* ---------- البيانات الأساسية ---------- */

export function UserInfoPanel({ user }: { user: UserDetails }) {
  const { dict } = useI18n();
  return (
    <Card>
      <CardTitle>{dict.admin.users.infoSection}</CardTitle>
      <ActionForm action={updateUserAction.bind(null, user.id)} className="space-y-4">
        <FormMessage />
        <InfoFields user={user} />
        <div className="flex justify-end">
          <SubmitButton pendingLabel={dict.common.saving}>{dict.common.save}</SubmitButton>
        </div>
      </ActionForm>
    </Card>
  );
}

function InfoFields({ user }: { user: UserDetails }) {
  const { dict } = useI18n();
  const nameError = useFieldError("name");
  const emailError = useFieldError("email");
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label={dict.auth.name} htmlFor="u-name" error={nameError}>
        <Input {...fieldAria("u-name", nameError)} name="name" defaultValue={user.name} required maxLength={100} />
      </Field>
      <Field label={dict.auth.email} htmlFor="u-email" error={emailError}>
        <Input {...fieldAria("u-email", emailError)} name="email" type="email" defaultValue={user.email} required dir="ltr" />
      </Field>
    </div>
  );
}

/* ---------- الأدوار ---------- */

export function RolesPanel({ user, roles, isSelf }: { user: UserDetails; roles: Role[]; isSelf: boolean }) {
  const { dict } = useI18n();
  const current = new Set((user.roles ?? []).map((r) => r.id));
  return (
    <Card>
      <CardTitle description={dict.admin.users.rolesHint}>{dict.admin.users.rolesSection}</CardTitle>
      <ActionForm action={updateRolesAction.bind(null, user.id)} className="space-y-4">
        <FormMessage />
        <fieldset className="grid gap-2 sm:grid-cols-2">
          <legend className="sr-only">{dict.admin.users.rolesSection}</legend>
          {roles.map((role) => {
            // المدير لا يستطيع إزالة دور الأدمن عن نفسه (والباك إند يمنع ذلك أيضًا)
            const locked = isSelf && role.code === "admin";
            return (
              <label key={role.id} className="flex cursor-pointer items-start gap-3 rounded-2xl p-4 ring-1 ring-line has-[:checked]:bg-ink-50 has-[:checked]:ring-ink-300 has-[:disabled]:cursor-not-allowed">
                <input type="checkbox" name="roles" value={role.id} defaultChecked={current.has(role.id)} disabled={locked} className="mt-1 size-4 accent-ink-700" />
                {locked ? <input type="hidden" name="roles" value={role.id} /> : null}
                <span>
                  <span className="flex items-center gap-1.5 font-semibold text-ink-900">
                    {role.code === "admin" ? <ShieldCheck className="size-4 text-saffron-600" aria-hidden /> : null}
                    {role.name}
                  </span>
                  {role.description ? <span className="block text-sm text-muted">{role.description}</span> : null}
                </span>
              </label>
            );
          })}
        </fieldset>
        <div className="flex justify-end">
          <SubmitButton variant="secondary" pendingLabel={dict.common.saving}>
            {dict.admin.users.saveRoles}
          </SubmitButton>
        </div>
      </ActionForm>
    </Card>
  );
}

/* ---------- الحظر ---------- */

export function BanPanel({ user, banned }: { user: UserDetails; banned: boolean }) {
  const { dict } = useI18n();
  const t = dict.admin.users;
  const [type, setType] = useState<"permanent" | "temporary">("permanent");

  return (
    <Card>
      <CardTitle>{t.banSection}</CardTitle>
      {banned ? (
        <ActionForm action={unbanUserAction.bind(null, user.id)} className="space-y-4">
          <FormMessage />
          <SubmitButton variant="secondary">
            <Undo2 className="size-4" aria-hidden />
            {t.unban}
          </SubmitButton>
        </ActionForm>
      ) : (
        <ActionForm action={banUserAction.bind(null, user.id)} className="space-y-4">
          <FormMessage />
          <fieldset>
            <legend className="mb-2 text-sm font-semibold text-ink-900">{t.banType}</legend>
            <div className="flex flex-wrap gap-2">
              {(["permanent", "temporary"] as const).map((value) => (
                <label key={value} className="cursor-pointer">
                  <input type="radio" name="type" value={value} checked={type === value} onChange={() => setType(value)} className="peer sr-only" />
                  <span className="inline-block rounded-full px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-line-strong peer-checked:bg-ink-700 peer-checked:text-white peer-checked:ring-ink-700 peer-focus-visible:outline peer-focus-visible:outline-3 peer-focus-visible:outline-saffron-400">
                    {value === "permanent" ? t.banPermanent : t.banTemporary}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          {type === "temporary" ? <BanUntilField /> : null}
          <SubmitButton variant="danger-soft">
            <Ban className="size-4" aria-hidden />
            {t.ban}
          </SubmitButton>
        </ActionForm>
      )}
    </Card>
  );
}

function BanUntilField() {
  const { dict } = useI18n();
  const error = useFieldError("ban_until");
  return (
    <Field label={dict.admin.users.banUntil} htmlFor="ban_until" error={error}>
      <Input {...fieldAria("ban_until", error)} name="ban_until" type="datetime-local" required className="sm:max-w-xs" dir="ltr" />
    </Field>
  );
}

/* ---------- كلمة المرور ---------- */

export function ResetPasswordPanel({ user }: { user: UserDetails }) {
  const { dict } = useI18n();
  const t = dict.admin.users;
  return (
    <Card>
      <CardTitle description={t.passwordHint}>{t.passwordSection}</CardTitle>
      <ActionForm action={resetPasswordAction.bind(null, user.email)} resetOnSuccess className="space-y-4">
        <FormMessage />
        <PasswordFields />
        <SubmitButton variant="secondary">
          <KeyRound className="size-4" aria-hidden />
          {t.resetPassword}
        </SubmitButton>
      </ActionForm>
    </Card>
  );
}

function PasswordFields() {
  const { dict } = useI18n();
  const error = useFieldError("password");
  const confirmError = useFieldError("password_confirmation");
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label={dict.profile.newPassword} htmlFor="ap-password" hint={dict.auth.passwordHint} error={error}>
        <Input {...fieldAria("ap-password", error, true)} name="password" type="password" autoComplete="new-password" minLength={8} required dir="ltr" />
      </Field>
      <Field label={dict.profile.confirmPassword} htmlFor="ap-confirm" error={confirmError}>
        <Input {...fieldAria("ap-confirm", confirmError)} name="password_confirmation" type="password" autoComplete="new-password" required dir="ltr" />
      </Field>
    </div>
  );
}

/* ---------- الحذف ---------- */

export function DeleteUserPanel({ user }: { user: UserDetails }) {
  const { dict } = useI18n();
  const t = dict.admin.users;
  return (
    <Card className="ring-danger/30">
      <CardTitle description={format(t.deleteBody, { name: user.name })}>{t.dangerSection}</CardTitle>
      <ConfirmAction
        action={deleteUserAction.bind(null, user.id)}
        title={t.deleteTitle}
        description={format(t.deleteBody, { name: user.name })}
        confirmLabel={dict.common.delete}
        trigger={t.delete}
        triggerIcon={<Trash2 className="size-4" aria-hidden />}
        triggerSize="md"
      />
    </Card>
  );
}
