"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import type { StoreProduct } from "@/lib/api/types";
import { updateProductAction } from "@/actions/admin-features";
import { useI18n } from "@/lib/i18n/client";
import { ActionForm, FormMessage, SubmitButton } from "@/components/ui/action-form";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input, Select, Textarea } from "@/components/ui/field";

/** تعديل سعر المنتج ومخزونه وحالته (§6) */
export function ProductEditor({ product }: { product: StoreProduct }) {
  const { dict } = useI18n();
  const t = dict.adminProducts;
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="secondary" size="sm" icon={<Pencil className="size-3.5" aria-hidden />} onClick={() => setOpen(true)} aria-label={`${t.edit}: ${product.book.title}`}>
        {dict.common.edit}
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} title={t.edit} description={product.book.title}>
        <ActionForm action={updateProductAction.bind(null, product.id)} onSuccess={() => setOpen(false)} className="space-y-4">
          <FormMessage />
          <div className="grid grid-cols-2 gap-4">
            <Field label={`${t.price} (${product.currency})`} htmlFor={`price-${product.id}`}>
              <Input id={`price-${product.id}`} name="price" inputMode="decimal" pattern="\d+(\.\d{1,2})?" defaultValue={product.price} required dir="ltr" />
            </Field>
            <Field label={t.stock} htmlFor={`stock-${product.id}`}>
              <Input id={`stock-${product.id}`} name="stock" type="number" min={0} step={1} defaultValue={product.stock} required dir="ltr" />
            </Field>
          </div>
          <Field label={t.status} htmlFor={`status-${product.id}`}>
            <Select id={`status-${product.id}`} name="status" defaultValue={product.status ?? "active"}>
              <option value="active">{t.statuses.active}</option>
              <option value="hidden">{t.statuses.hidden}</option>
            </Select>
          </Field>
          <Field label={t.shippingInfo} htmlFor={`ship-${product.id}`} optionalLabel={dict.common.optional}>
            <Textarea id={`ship-${product.id}`} name="shipping_info" defaultValue={product.shipping_info ?? ""} rows={2} className="min-h-16" />
          </Field>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>
              {dict.common.cancel}
            </Button>
            <SubmitButton pendingLabel={dict.common.saving}>{dict.common.save}</SubmitButton>
          </div>
        </ActionForm>
      </Dialog>
    </>
  );
}
