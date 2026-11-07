"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { ArrowLeft, ArrowRight, Check, ChevronLeft, ChevronRight, ListTree, Loader2, Minus, Plus, Settings2, X } from "lucide-react";
import { saveProgressAction } from "@/actions/features";
import { useI18n } from "@/lib/i18n/client";
import { format, localeMeta } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

type Theme = "light" | "sepia" | "dark";
type TocItem = { title: string; page: number; depth: number };

const SETTINGS_KEY = "lala_reader_settings";
const themeStyles: Record<Theme, { page: string; bar: string; canvas: string }> = {
  light: { page: "bg-[#f3f1ec] text-ink-900", bar: "bg-[#f3f1ec]/95", canvas: "" },
  sepia: { page: "bg-[#eadfc8] text-[#4a3b28]", bar: "bg-[#eadfc8]/95", canvas: "sepia(0.45) contrast(0.95)" },
  dark: { page: "bg-[#14191c] text-ink-100", bar: "bg-[#14191c]/95", canvas: "invert(0.9) hue-rotate(180deg) brightness(0.95)" },
};

type Settings = { theme: Theme; scale: number };
const DEFAULT_SETTINGS = '{"theme":"light","scale":1}';
const listeners = new Set<() => void>();

/** إعدادات القراءة محفوظة في هذا المتصفح فقط (localStorage) عبر useSyncExternalStore */
function readRaw(): string {
  try {
    return localStorage.getItem(SETTINGS_KEY) ?? DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS; // التخزين غير متاح (وضع التصفح الخاص…)
  }
}

function parseSettings(raw: string): Settings {
  try {
    const v = JSON.parse(raw) as Partial<Settings>;
    return { theme: v.theme && v.theme in themeStyles ? v.theme : "light", scale: typeof v.scale === "number" ? v.scale : 1 };
  } catch {
    return { theme: "light", scale: 1 };
  }
}

function writeSettings(next: Settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  } catch {
    // تجاهل
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * قارئ PDF (§3) مبني على pdf.js:
 * التنقل بين الصفحات والفصول (فهرس الملف)، الانتقال لصفحة، التكبير،
 * أنماط القراءة، وحفظ آخر صفحة تلقائيًا في الباك إند.
 */
export function PdfReader({ slug, title, fileUrl, initialPage }: { slug: string; title: string; fileUrl: string | null; initialPage: number }) {
  const { locale, dict } = useI18n();
  const t = dict.reader;
  const rtl = localeMeta[locale].dir === "rtl";

  const [doc, setDoc] = useState<PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [page, setPage] = useState(Math.max(1, initialPage));
  const settings = parseSettings(useSyncExternalStore(subscribe, readRaw, () => DEFAULT_SETTINGS));
  const { theme, scale } = settings;
  const setTheme = (th: Theme) => writeSettings({ ...settings, theme: th });
  const setScale = (fn: (s: number) => number) => writeSettings({ ...settings, scale: fn(scale) });
  // preview: وضع المعاينة للمطورين (لا يوجد ملف بعد)
  const [status, setStatus] = useState<"loading" | "ready" | "error" | "preview">(fileUrl ? "loading" : "preview");
  const [savedPage, setSavedPage] = useState(0);
  const [panel, setPanel] = useState<"none" | "settings" | "toc">("none");
  const [toc, setToc] = useState<TocItem[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  // تحميل الملف
  useEffect(() => {
    if (!fileUrl) return;
    let cancelled = false;
    let loadingTask: { destroy: () => Promise<void> } | null = null;
    (async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
        const taskRef = pdfjs.getDocument({
          url: fileUrl,
          withCredentials: true,
          // تُنسخ إلى public/pdfjs تلقائيًا بعد npm install
          standardFontDataUrl: "/pdfjs/standard_fonts/",
          cMapUrl: "/pdfjs/cmaps/",
          cMapPacked: true,
        });
        loadingTask = taskRef;
        const loaded = await taskRef.promise;
        if (cancelled) return;
        setDoc(loaded);
        setNumPages(loaded.numPages);
        setPage((p) => Math.min(p, loaded.numPages));
        setStatus("ready");
        setToc(await buildToc(loaded));
      } catch (error) {
        console.error(error);
        if (!cancelled) setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
      void loadingTask?.destroy();
    };
  }, [fileUrl]);

  // رسم الصفحة الحالية بعرض منطقة القراءة × التكبير
  useEffect(() => {
    if (!doc || !canvasRef.current || !stageRef.current) return;
    let cancelled = false;
    let task: { cancel: () => void } | null = null;
    (async () => {
      const pdfPage = await doc.getPage(page);
      if (cancelled) return;
      const base = pdfPage.getViewport({ scale: 1 });
      const width = Math.min(stageRef.current!.clientWidth - 32, 900) * scale;
      const viewport = pdfPage.getViewport({ scale: width / base.width });
      const ratio = window.devicePixelRatio || 1;
      const canvas = canvasRef.current!;
      canvas.width = Math.floor(viewport.width * ratio);
      canvas.height = Math.floor(viewport.height * ratio);
      canvas.style.width = `${Math.floor(viewport.width)}px`;
      canvas.style.height = `${Math.floor(viewport.height)}px`;
      const render = pdfPage.render({ canvas, viewport, transform: ratio !== 1 ? [ratio, 0, 0, ratio, 0, 0] : undefined });
      task = render;
      await render.promise.catch(() => undefined);
    })();
    return () => {
      cancelled = true;
      task?.cancel();
    };
  }, [doc, page, scale]);

  // حفظ التقدم بعد التوقف ثانية ونصف على الصفحة
  useEffect(() => {
    if (!numPages) return;
    const id = setTimeout(async () => {
      if (await saveProgressAction(slug, page, numPages)) setSavedPage(page);
    }, 1500);
    return () => clearTimeout(id);
  }, [slug, page, numPages]);

  const go = useCallback((target: number) => setPage(() => Math.max(1, Math.min(numPages || 1, target))), [numPages]);

  // لوحة المفاتيح: الأسهم تحترم اتجاه القراءة
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === "INPUT") return;
      const forward = rtl ? "ArrowLeft" : "ArrowRight";
      const back = rtl ? "ArrowRight" : "ArrowLeft";
      if (e.key === forward || e.key === "PageDown") go(page + 1);
      if (e.key === back || e.key === "PageUp") go(page - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, page, rtl]);

  const percent = numPages ? Math.round((page / numPages) * 100) : 0;
  const Back = rtl ? ArrowRight : ArrowLeft;
  const PrevIcon = rtl ? ChevronRight : ChevronLeft;
  const NextIcon = rtl ? ChevronLeft : ChevronRight;
  const iconBtn = "grid size-11 place-items-center rounded-full hover:bg-black/5 disabled:opacity-40";

  return (
    <div className={cn("flex min-h-dvh flex-col transition-colors", themeStyles[theme].page)}>
      {/* الشريط العلوي: بسيط حتى لا يشتت القارئ */}
      <header className={cn("sticky top-0 z-20 border-b border-black/5 backdrop-blur", themeStyles[theme].bar)}>
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-2 px-3">
          <Link href={`/${locale}/books/${slug}`} className={iconBtn} aria-label={t.back}>
            <Back className="size-5" aria-hidden />
          </Link>
          <p className="min-w-0 flex-1 truncate text-center font-display text-lg font-bold">{title}</p>
          {toc.length ? (
            <button type="button" className={iconBtn} aria-label={t.goTo} aria-expanded={panel === "toc"} onClick={() => setPanel(panel === "toc" ? "none" : "toc")}>
              <ListTree className="size-5" aria-hidden />
            </button>
          ) : null}
          <button type="button" className={iconBtn} aria-label={t.settings} aria-expanded={panel === "settings"} onClick={() => setPanel(panel === "settings" ? "none" : "settings")}>
            <Settings2 className="size-5" aria-hidden />
          </button>
        </div>
        <div className="h-1 bg-black/5" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label={format(t.progress, { percent })}>
          <div className="h-full bg-saffron-400 transition-[width]" style={{ width: `${percent}%` }} />
        </div>
      </header>

      {panel !== "none" ? (
        <div className="fixed inset-x-0 top-[3.75rem] z-30 mx-auto max-w-md px-3">
          <div className="rounded-3xl bg-surface p-5 text-fg shadow-lift ring-1 ring-line">
            <div className="mb-3 flex items-center justify-between">
              <p className="font-bold">{panel === "settings" ? t.settings : t.goTo}</p>
              <button type="button" onClick={() => setPanel("none")} className="grid size-9 place-items-center rounded-full hover:bg-surface-2" aria-label={dict.common.close}>
                <X className="size-5" aria-hidden />
              </button>
            </div>
            {panel === "settings" ? (
              <div className="space-y-5">
                <div>
                  <p className="mb-2 text-sm font-semibold text-muted">{t.theme}</p>
                  <div className="grid grid-cols-3 gap-2">
                    {(Object.keys(themeStyles) as Theme[]).map((th) => (
                      <button key={th} type="button" onClick={() => setTheme(th)} aria-pressed={theme === th} className={cn("h-12 rounded-2xl text-sm font-semibold ring-2", themeStyles[th].page, theme === th ? "ring-saffron-400" : "ring-transparent")}>
                        {t.themes[th]}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-muted">{Math.round(scale * 100)}%</span>
                  <div className="flex gap-2">
                    <button type="button" className="grid size-11 place-items-center rounded-full bg-surface-2" onClick={() => setScale((s) => Math.max(0.6, +(s - 0.1).toFixed(1)))} aria-label={t.zoomOut}>
                      <Minus className="size-5" aria-hidden />
                    </button>
                    <button type="button" className="grid size-11 place-items-center rounded-full bg-surface-2" onClick={() => setScale((s) => Math.min(2, +(s + 0.1).toFixed(1)))} aria-label={t.zoomIn}>
                      <Plus className="size-5" aria-hidden />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <ul className="max-h-[60dvh] space-y-1 overflow-y-auto">
                {toc.map((item, i) => (
                  <li key={i}>
                    <button type="button" onClick={() => { go(item.page); setPanel("none"); }} className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-start hover:bg-surface-2" style={{ paddingInlineStart: `${0.75 + item.depth}rem` }}>
                      <span className="truncate">{item.title}</span>
                      <span className="text-xs text-muted">{item.page}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : null}

      <main id="main" ref={stageRef} className="flex flex-1 items-start justify-center overflow-x-auto px-4 py-6">
        {status === "loading" ? (
          <p className="mt-24 inline-flex items-center gap-2 text-sm opacity-70">
            <Loader2 className="size-5 animate-spin" aria-hidden />
            {t.loading}
          </p>
        ) : status === "preview" ? (
          <div aria-hidden className="aspect-[1/1.414] w-full max-w-[38rem] rounded-sm bg-white p-10 shadow-lift">
            <div className="space-y-3">
              {Array.from({ length: 14 }, (_, i) => (
                <div key={i} className="h-2.5 rounded-full bg-surface-2" style={{ width: `${70 + ((i * 37) % 30)}%` }} />
              ))}
            </div>
          </div>
        ) : status === "error" ? (
          <p role="alert" className="mt-24 rounded-2xl bg-surface px-5 py-4 text-sm text-danger shadow-soft">
            {t.loadError}
          </p>
        ) : (
          <canvas ref={canvasRef} className="rounded-sm bg-white shadow-lift" style={{ filter: themeStyles[theme].canvas }} aria-label={format(t.pageOf, { page, total: numPages })} />
        )}
      </main>

      {/* شريط التنقل السفلي: أزرار كبيرة يسهل لمسها بيد واحدة */}
      <footer className={cn("sticky bottom-0 z-20 border-t border-black/5 backdrop-blur", themeStyles[theme].bar)}>
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-3 px-3">
          <button type="button" className={iconBtn} onClick={() => go(page - 1)} disabled={page <= 1 || status !== "ready"} aria-label={t.previous}>
            <PrevIcon className="size-6" aria-hidden />
          </button>
          <form
            className="flex items-center gap-2 text-sm"
            onSubmit={(e) => {
              e.preventDefault();
              const v = Number(new FormData(e.currentTarget).get("page"));
              if (Number.isInteger(v)) go(v);
            }}
          >
            <label htmlFor="reader-page" className="sr-only">
              {t.goTo}
            </label>
            <input key={page} id="reader-page" name="page" type="number" inputMode="numeric" min={1} max={numPages || 1} defaultValue={page} disabled={status !== "ready"} className="h-10 w-16 rounded-xl bg-surface/80 text-center font-semibold text-fg ring-1 ring-black/10" />
            <span className="opacity-70">/ {numPages || "—"}</span>
            <span className="ms-2 inline-flex w-5 justify-center" aria-live="polite">
              {savedPage === page ? <Check className="size-4 text-success" aria-label={t.saved} /> : null}
            </span>
          </form>
          <button type="button" className={iconBtn} onClick={() => go(page + 1)} disabled={page >= numPages || status !== "ready"} aria-label={t.next}>
            <NextIcon className="size-6" aria-hidden />
          </button>
        </div>
      </footer>
    </div>
  );
}

/** فهرس الفصول من الـ outline المضمّن في ملف PDF (إن وُجد) */
async function buildToc(doc: PDFDocumentProxy): Promise<TocItem[]> {
  const outline = await doc.getOutline().catch(() => null);
  if (!outline) return [];
  const items: TocItem[] = [];
  async function walk(nodes: typeof outline, depth: number) {
    for (const node of nodes ?? []) {
      try {
        const dest = typeof node.dest === "string" ? await doc.getDestination(node.dest) : node.dest;
        if (dest && dest[0]) {
          const index = await doc.getPageIndex(dest[0] as Parameters<PDFDocumentProxy["getPageIndex"]>[0]);
          items.push({ title: node.title, page: index + 1, depth });
        }
      } catch {
        // وجهة غير صالحة في الملف — نتجاهلها
      }
      if (node.items?.length && depth < 2) await walk(node.items, depth + 1);
    }
  }
  await walk(outline, 0);
  return items;
}
