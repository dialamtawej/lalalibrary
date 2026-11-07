"use client";

import { Trash2 } from "lucide-react";
import { removeCartItemAction, updateCartItemAction } from "@/actions/features";
import { useI18n } from "@/lib/i18n/client";
import { ActionForm, useFormState } from "@/components/ui/action-form";
import { ActionButton } from "@/components/ui/action-button";

/** تعديل الكمية (يُرسل فور التغيير) وإزالة المنتج */
export function CartItemControls({ itemId, quantity, max, title }: { itemId: number; quantity: number; max: number; title: string }) {
  const { dict } = useI18n();
  const limit = Math.max(quantity, Math.min(10, max));
  return (
    <div className="flex items-start gap-2">
      <ActionForm action={updateCartItemAction.bind(null, itemId)}>
        <QuantitySelect id={`cart-qty-${itemId}`} quantity={quantity} limit={limit} label={`${dict.cart.quantity}: ${title}`} />
      </ActionForm>
      <ActionButton action={removeCartItemAction.bind(null, itemId)} variant="ghost" size="icon" ariaLabel={`${dict.cart.remove}: ${title}`} icon={<Trash2 className="size-4" aria-hidden />} />
    </div>
  );
}

function QuantitySelect({ id, quantity, limit, label }: { id: string; quantity: number; limit: number; label: string }) {
  const { state, pending } = useFormState();
  return (
    <>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <select
        id={id}
        name="quantity"
        key={quantity}
        defaultValue={quantity}
        disabled={pending}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="h-11 rounded-full bg-surface px-4 font-semibold ring-1 ring-inset ring-line-strong"
      >
        {Array.from({ length: limit }, (_, i) => (
          <option key={i + 1} value={i + 1}>
            {i + 1}
          </option>
        ))}
      </select>
      {state.status === "error" && state.message ? (
        <p role="alert" className="mt-1 text-xs text-danger">
          {state.message}
        </p>
      ) : null}
    </>
  );
}
