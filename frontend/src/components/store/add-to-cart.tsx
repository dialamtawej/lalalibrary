"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { addToCartAction } from "@/actions/features";
import { useI18n } from "@/lib/i18n/client";
import { ActionForm, SubmitButton, useFormState } from "@/components/ui/action-form";

/** إضافة نسخة ورقية إلى السلة (§7) */
export function AddToCart({ productId, maxQuantity, compact }: { productId: number; maxQuantity: number; compact?: boolean }) {
  const { dict } = useI18n();
  const max = Math.max(1, Math.min(10, maxQuantity));
  return (
    <ActionForm action={addToCartAction.bind(null, productId)} className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        {!compact ? (
          <>
            <label htmlFor={`qty-${productId}`} className="sr-only">
              {dict.store.quantity}
            </label>
            <select id={`qty-${productId}`} name="quantity" defaultValue="1" className="h-11 rounded-full bg-surface px-4 font-semibold ring-1 ring-inset ring-line-strong">
              {Array.from({ length: max }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
          </>
        ) : (
          <input type="hidden" name="quantity" value="1" />
        )}
        <SubmitButton variant="accent" size={compact ? "sm" : "md"} className={compact ? "" : "flex-1"}>
          <ShoppingCart className="size-4" aria-hidden />
          {dict.store.addToCart}
        </SubmitButton>
      </div>
      <Feedback />
    </ActionForm>
  );
}

function Feedback() {
  const { locale, dict } = useI18n();
  const { state } = useFormState();
  if (state.status === "success")
    return (
      <p role="status" className="text-sm text-success">
        {dict.store.added}{" "}
        <Link href={`/${locale}/cart`} className="font-semibold underline">
          {dict.store.viewCart}
        </Link>
      </p>
    );
  if (state.status === "error" && state.message)
    return (
      <p role="alert" className="text-sm text-danger">
        {state.message}
      </p>
    );
  return null;
}
