"use client";

import { Banknote } from "lucide-react";
import { placeOrderAction } from "@/actions/features";
import { useI18n } from "@/lib/i18n/client";
import { ActionForm, FormMessage, SubmitButton, useFieldError } from "@/components/ui/action-form";
import { Field, Input, Textarea, fieldAria } from "@/components/ui/field";
import { Card, CardTitle } from "@/components/ui/misc";

/** نموذج الشحن والدفع عند الاستلام (§8). لا يُطلب أي بيانات بطاقة. */
export function CheckoutForm({ defaultName }: { defaultName: string }) {
  const { dict } = useI18n();
  const t = dict.checkout;
  return (
    <ActionForm action={placeOrderAction} id="checkout-form" className="space-y-6">
      <FormMessage />
      <Card>
        <CardTitle>{t.shipping}</CardTitle>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField name="name" label={t.name} autoComplete="name" defaultValue={defaultName} />
          <TextField name="phone" label={t.phone} type="tel" autoComplete="tel" dir="ltr" />
          <TextField name="city" label={t.city} autoComplete="address-level2" />
          <TextField name="address" label={t.address} autoComplete="street-address" className="sm:col-span-2" />
          <Field label={t.notes} htmlFor="notes" optionalLabel={dict.common.optional} className="sm:col-span-2">
            <Textarea id="notes" name="notes" rows={3} maxLength={500} className="min-h-20" />
          </Field>
        </div>
      </Card>
      <Card>
        <CardTitle>{t.payment}</CardTitle>
        <div className="flex items-start gap-3 rounded-2xl bg-ink-50 p-4 ring-1 ring-ink-200">
          <Banknote className="mt-0.5 size-5 text-ink-700" aria-hidden />
          <div>
            <p className="font-semibold text-ink-900">{t.cod}</p>
            <p className="text-sm text-muted">{t.codHint}</p>
          </div>
        </div>
      </Card>
      <SubmitButton variant="accent" size="lg" className="w-full sm:w-auto">
        {t.placeOrder}
      </SubmitButton>
    </ActionForm>
  );
}

function TextField({ name, label, type = "text", autoComplete, defaultValue, dir, className }: { name: string; label: string; type?: string; autoComplete?: string; defaultValue?: string; dir?: "ltr"; className?: string }) {
  const error = useFieldError(name);
  return (
    <Field label={label} htmlFor={name} error={error} className={className}>
      <Input {...fieldAria(name, error)} name={name} type={type} autoComplete={autoComplete} defaultValue={defaultValue} required dir={dir} maxLength={255} />
    </Field>
  );
}
