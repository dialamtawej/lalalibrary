"use client";

import type { ComponentProps } from "react";
import { Select } from "@/components/ui/field";

/** قائمة اختيار ترسل نموذج البحث فور تغييرها (تحسين تدريجي: النموذج يعمل بدون JS أيضًا) */
export function AutoSubmitSelect(props: ComponentProps<"select">) {
  return <Select {...props} onChange={(e) => e.currentTarget.form?.requestSubmit()} />;
}
