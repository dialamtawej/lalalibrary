import Image from "next/image";
import { cn } from "@/lib/utils";

/** ألوان أغلفة بديلة عندما لا يكون للكتاب صورة غلاف */
const palettes = [
  { bg: "from-ink-700 to-ink-900", band: "bg-saffron-400", text: "text-white" },
  { bg: "from-plum-500 to-plum-700", band: "bg-saffron-300", text: "text-white" },
  { bg: "from-saffron-300 to-saffron-500", band: "bg-ink-800", text: "text-ink-900" },
  { bg: "from-ink-400 to-ink-600", band: "bg-plum-200", text: "text-white" },
  { bg: "from-[#3b5249] to-[#1f2f29]", band: "bg-saffron-300", text: "text-white" },
];

export function BookCover({
  title,
  src,
  seed,
  className,
  sizes = "(min-width: 1024px) 220px, (min-width: 640px) 30vw, 45vw",
  priority,
}: {
  title: string;
  src: string | null;
  seed: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const palette = palettes[Math.abs(seed) % palettes.length];

  return (
    <div className={cn("@container relative aspect-[2/3] overflow-hidden rounded-e-lg rounded-s-sm bg-surface-2 shadow-book", className)}>
      {src ? (
        <Image src={src} alt={title} fill sizes={sizes} priority={priority} className="object-cover" />
      ) : (
        <div className={cn("absolute inset-0 flex flex-col justify-between bg-gradient-to-br p-[8%]", palette.bg, palette.text)} role="img" aria-label={title}>
          <span className={cn("h-1.5 w-[30%] rounded-full", palette.band)} aria-hidden />
          <span className="line-clamp-4 font-display text-[clamp(0.8rem,11cqi,1.25rem)] font-bold leading-snug @max-[6rem]:hidden" aria-hidden>
            {title}
          </span>
          <span className={cn("h-px w-full opacity-40", palette.band)} aria-hidden />
        </div>
      )}
      {/* ظل كعب الكتاب */}
      <span aria-hidden className="pointer-events-none absolute inset-y-0 start-0 w-2.5 bg-gradient-to-r from-black/25 to-transparent rtl:bg-gradient-to-l" />
    </div>
  );
}
