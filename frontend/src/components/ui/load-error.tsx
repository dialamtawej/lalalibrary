import { CloudOff } from "lucide-react";
import { isApiError } from "@/lib/api/errors";
import type { Dictionary } from "@/lib/i18n/dictionaries/ar";
import { Alert } from "./alert";

/** رسالة فشل تحميل قسم من الصفحة دون إسقاط الصفحة كاملة */
export function LoadError({ error, dict, title }: { error: unknown; dict: Dictionary; title: string }) {
  if (!isApiError(error)) console.error(error);
  const detail = isApiError(error) && error.isNetwork ? dict.errors.network : dict.errors.server;
  return (
    <Alert tone="warning" title={title} className="items-center">
      <span className="inline-flex items-center gap-2">
        <CloudOff className="size-4" aria-hidden />
        {detail}
      </span>
    </Alert>
  );
}
