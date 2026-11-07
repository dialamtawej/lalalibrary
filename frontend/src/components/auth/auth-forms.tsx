"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { loginAction, registerAction } from "@/actions/auth";
import { useI18n } from "@/lib/i18n/client";
import { ActionForm, FormMessage, SubmitButton, useFieldError } from "@/components/ui/action-form";
import { Field, Input, fieldAria } from "@/components/ui/field";

function PasswordInput({ id, name, autoComplete, hint }: { id: string; name: string; autoComplete: string; hint?: boolean }) {
  const { dict } = useI18n();
  const [visible, setVisible] = useState(false);
  const error = useFieldError(name);
  return (
    // dir=ltr حتى يكون زر الإظهار في نفس جهة الحشوة pe-12 (كلمة المرور تُكتب من اليسار)
    <div className="relative" dir="ltr">
      <Input {...fieldAria(id, error, hint)} name={name} type={visible ? "text" : "password"} autoComplete={autoComplete} required minLength={name === "password" && hint ? 8 : undefined} dir="ltr" className="pe-12" />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute end-1.5 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full text-muted hover:bg-surface-2"
        aria-label={dict.auth.password}
        aria-pressed={visible}
      >
        {visible ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
      </button>
    </div>
  );
}

function EmailField() {
  const { dict } = useI18n();
  const error = useFieldError("email");
  return (
    <Field label={dict.auth.email} htmlFor="email" error={error}>
      <Input {...fieldAria("email", error)} name="email" type="email" autoComplete="email" required dir="ltr" />
    </Field>
  );
}

export function LoginForm({ next }: { next?: string }) {
  const { dict } = useI18n();
  return (
    <ActionForm action={loginAction} className="space-y-5">
      {next ? <input type="hidden" name="next" value={next} /> : null}
      <FormMessage />
      <EmailField />
      <LoginPassword />
      <SubmitButton size="lg" className="w-full">
        {dict.auth.loginSubmit}
      </SubmitButton>
    </ActionForm>
  );
}

function LoginPassword() {
  const { dict } = useI18n();
  const error = useFieldError("password");
  return (
    <Field label={dict.auth.password} htmlFor="password" error={error}>
      <PasswordInput id="password" name="password" autoComplete="current-password" />
    </Field>
  );
}

export function RegisterForm() {
  const { dict } = useI18n();
  return (
    <ActionForm action={registerAction} className="space-y-5">
      <FormMessage />
      <NameField />
      <EmailField />
      <RegisterPasswords />
      <SubmitButton size="lg" className="w-full">
        {dict.auth.registerSubmit}
      </SubmitButton>
    </ActionForm>
  );
}

function NameField() {
  const { dict } = useI18n();
  const error = useFieldError("name");
  return (
    <Field label={dict.auth.name} htmlFor="name" error={error}>
      <Input {...fieldAria("name", error)} name="name" autoComplete="name" required maxLength={100} />
    </Field>
  );
}

function RegisterPasswords() {
  const { dict } = useI18n();
  const passwordError = useFieldError("password");
  const confirmError = useFieldError("password_confirmation");
  return (
    <>
      <Field label={dict.auth.password} htmlFor="password" hint={dict.auth.passwordHint} error={passwordError}>
        <PasswordInput id="password" name="password" autoComplete="new-password" hint />
      </Field>
      <Field label={dict.auth.passwordConfirm} htmlFor="password_confirmation" error={confirmError}>
        <PasswordInput id="password_confirmation" name="password_confirmation" autoComplete="new-password" />
      </Field>
    </>
  );
}
