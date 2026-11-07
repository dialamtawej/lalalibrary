import { cacheLife } from "next/cache";
import { format } from "@/lib/i18n/config";

/** السنة الحالية مخزنة مؤقتًا ليوم (Cache Components يمنع new Date() بدون تحديد مدة صلاحية) */
export async function CurrentYear({ template }: { template: string }) {
  "use cache";
  cacheLife("days");
  return format(template, { year: new Date().getFullYear() });
}
