"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

/** عرض التقييم بالنجوم (للقراءة فقط) */
export function Stars({ value, size = "sm", label }: { value: number; size?: "sm" | "md" | "lg"; label: string }) {
  const dims = { sm: "size-4", md: "size-5", lg: "size-7" }[size];
  return (
    <span className="inline-flex items-center gap-0.5" role="img" aria-label={label}>
      {[1, 2, 3, 4, 5].map((n) => {
        const fill = Math.max(0, Math.min(1, value - (n - 1)));
        return (
          <span key={n} className={cn("relative inline-block", dims)} aria-hidden>
            <Star className={cn("absolute inset-0 text-line-strong", dims)} />
            <span className="absolute inset-y-0 start-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Star className={cn("fill-saffron-400 text-saffron-500", dims)} />
            </span>
          </span>
        );
      })}
    </span>
  );
}

/** اختيار التقييم: مجموعة أزرار راديو يمكن التنقل بينها بلوحة المفاتيح */
export function StarInput({ name, defaultValue = 0, legend, labels, invalid }: { name: string; defaultValue?: number; legend: string; labels: (n: number) => string; invalid?: boolean }) {
  const [value, setValue] = useState(defaultValue);
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  return (
    <fieldset aria-invalid={invalid || undefined}>
      <legend className="mb-2 text-sm font-semibold text-ink-900">{legend}</legend>
      <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <label key={n} className="cursor-pointer rounded-lg p-1 has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-saffron-400" onMouseEnter={() => setHover(n)}>
            <input type="radio" name={name} value={n} checked={value === n} onChange={() => setValue(n)} className="sr-only" />
            <span className="sr-only">{labels(n)}</span>
            <Star aria-hidden className={cn("size-8 transition-colors", n <= shown ? "fill-saffron-400 text-saffron-500" : "text-line-strong")} />
          </label>
        ))}
      </div>
    </fieldset>
  );
}
