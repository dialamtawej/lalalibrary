"use client";

import type { OrderStatus } from "@/lib/api/types";
import { updateOrderStatusAction } from "@/actions/admin-features";
import { useI18n } from "@/lib/i18n/client";
import { ActionForm, FormMessage, SubmitButton } from "@/components/ui/action-form";
import { Field, Select } from "@/components/ui/field";
import { Card, CardTitle } from "@/components/ui/misc";

/**
 * الانتقالات المسموحة (من الدراسة): pending → confirmed → preparing → shipped → delivered
 * والإلغاء ممكن قبل الشحن فقط. الباك إند يتحقق أيضًا ويعيد 422 لأي انتقال غير مسموح.
 */
const NEXT: Record<OrderStatus, OrderStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

export function OrderStatusForm({ orderId, status }: { orderId: number; status: OrderStatus }) {
  const { dict } = useI18n();
  const options = NEXT[status];
  if (!options.length) return null;
  return (
    <Card>
      <CardTitle>{dict.adminOrders.updateStatus}</CardTitle>
      <ActionForm action={updateOrderStatusAction.bind(null, orderId)} className="space-y-4">
        <FormMessage />
        <Field label={dict.adminOrders.newStatus} htmlFor="new-status">
          <Select id="new-status" name="status" defaultValue={options[0]} key={status}>
            {options.map((s) => (
              <option key={s} value={s}>
                {dict.orders.status[s]}
              </option>
            ))}
          </Select>
        </Field>
        <SubmitButton className="w-full">{dict.adminOrders.updateStatus}</SubmitButton>
      </ActionForm>
    </Card>
  );
}
