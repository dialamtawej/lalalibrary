"use client";

import { createContext, startTransition, use, useActionState, useEffect, useRef, type ComponentProps, type FormEvent, type ReactNode } from "react";
import { useI18n } from "@/lib/i18n/client";
import { idleState, type ActionState } from "@/lib/actions/types";
import { Alert } from "./alert";
import { Button, type ButtonVariant, type ButtonSize } from "./button";

type FormAction = (state: ActionState, formData: FormData) => Promise<ActionState>;

type FormContextValue = { state: ActionState; pending: boolean };
const FormContext = createContext<FormContextValue>({ state: idleState, pending: false });

export function useFormState() {
  return use(FormContext);
}

type ActionFormProps = Omit<ComponentProps<"form">, "action" | "onSubmit" | "children"> & {
  action: FormAction;
  children: ReactNode | ((ctx: FormContextValue) => ReactNode);
  /** إعادة تعيين الحقول بعد النجاح (مثل نماذج كلمة المرور) */
  resetOnSuccess?: boolean;
  onSuccess?: (state: ActionState) => void;
};

/**
 * نموذج موحّد مبني على Server Actions:
 * - يرسل اللغة الحالية تلقائيًا (حقل lang) حتى تُترجم رسائل الخادم.
 * - لا يمسح الحقول عند الخطأ (React 19 يمسحها افتراضيًا مع action=)
 *   لأننا نستدعي الـ action يدويًا داخل startTransition.
 * - يوفّر الحالة (state, pending) للمكونات الداخلية عبر Context.
 */
export function ActionForm({ action, children, resetOnSuccess, onSuccess, ...props }: ActionFormProps) {
  const { locale } = useI18n();
  const [state, dispatch, pending] = useActionState(action, idleState);
  const formRef = useRef<HTMLFormElement>(null);
  const lastHandled = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (state.status !== "success" || state.at === lastHandled.current) return;
    lastHandled.current = state.at;
    if (resetOnSuccess) formRef.current?.reset();
    onSuccess?.(state);
  }, [state, resetOnSuccess, onSuccess]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.set("lang", locale);
    startTransition(() => dispatch(formData));
  }

  const ctx = { state, pending };
  return (
    <FormContext value={ctx}>
      <form ref={formRef} onSubmit={handleSubmit} noValidate={false} {...props}>
        {typeof children === "function" ? children(ctx) : children}
      </form>
    </FormContext>
  );
}

/** رسالة النجاح أو الخطأ العامة للنموذج */
export function FormMessage({ className }: { className?: string }) {
  const { state } = useFormState();
  if (state.status === "idle" || !state.message) return null;
  return (
    <Alert key={state.at} tone={state.status === "success" ? "success" : "danger"} className={className}>
      {state.message}
    </Alert>
  );
}

/** خطأ حقل معيّن من استجابة Laravel (422) */
export function useFieldError(name: string): string | undefined {
  const { state } = useFormState();
  return state.status === "error" ? state.fieldErrors?.[name] : undefined;
}

export function SubmitButton({
  children,
  variant = "primary",
  size = "md",
  className,
  pendingLabel,
}: {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  pendingLabel?: string;
}) {
  const { pending } = useFormState();
  return (
    <Button type="submit" variant={variant} size={size} loading={pending} className={className}>
      {pending && pendingLabel ? pendingLabel : children}
    </Button>
  );
}
