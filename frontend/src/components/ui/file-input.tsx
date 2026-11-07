"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { FileText, ImagePlus, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * حقل رفع ملف بشكل منطقة واضحة، مع معاينة للصور واسم الملف المختار.
 */
export function FileInput({
  id,
  name,
  accept,
  label,
  kind = "image",
  currentUrl,
  invalid,
  describedBy,
}: {
  id: string;
  name: string;
  accept: string;
  label: string;
  kind?: "image" | "document";
  currentUrl?: string | null;
  invalid?: boolean;
  describedBy?: string;
}) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const shown = preview ?? (kind === "image" ? currentUrl : null);
  const Icon = kind === "image" ? ImagePlus : FileText;

  return (
    <label
      htmlFor={id}
      className={cn(
        "group flex cursor-pointer items-center gap-4 rounded-2xl border-2 border-dashed bg-surface p-4 transition-colors hover:border-ink-400 hover:bg-ink-50/40 focus-within:border-ink-500",
        invalid ? "border-danger" : "border-line-strong",
      )}
    >
      {shown ? (
        <span className="relative h-20 w-14 shrink-0 overflow-hidden rounded-lg shadow-book">
          <Image src={shown} alt="" fill sizes="56px" className="object-cover" />
        </span>
      ) : (
        <span className="grid size-14 shrink-0 place-items-center rounded-xl bg-saffron-100 text-ink-800">
          <Icon className="size-6" aria-hidden />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2 font-semibold text-ink-800">
          <Upload className="size-4" aria-hidden />
          {label}
        </span>
        {fileName ? <span className="mt-1 block truncate text-sm text-muted" dir="auto">{fileName}</span> : null}
      </span>
      <input
        id={id}
        name={name}
        type="file"
        accept={accept}
        className="sr-only"
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        onChange={(e) => {
          const file = e.target.files?.[0];
          setFileName(file?.name ?? null);
          setPreview(file && kind === "image" ? URL.createObjectURL(file) : null);
        }}
      />
    </label>
  );
}
