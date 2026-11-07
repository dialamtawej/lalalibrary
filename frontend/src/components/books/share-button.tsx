"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";
import { useI18n } from "@/lib/i18n/client";
import { Button } from "@/components/ui/button";

/** مشاركة رابط الكتاب: قائمة المشاركة في الموبايل، أو نسخ الرابط في الديسكتوب */
export function ShareButton({ title }: { title: string }) {
  const { dict } = useI18n();
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // المستخدم أغلق قائمة المشاركة
      }
      return;
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Button variant="secondary" onClick={share} icon={copied ? <Check className="size-4" aria-hidden /> : <Share2 className="size-4" aria-hidden />}>
      {dict.books.details.share}
    </Button>
  );
}
