// ينسخ ملفات pdf.js المساعدة (الخطوط القياسية و cMaps) إلى public/pdfjs
// حتى يعرض قارئ الكتب ملفات PDF التي لا تضمّن خطوطها بشكل صحيح.
// يعمل تلقائيًا بعد npm install (postinstall). المجلد الناتج غير مرفوع إلى Git.
import { cpSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "node_modules", "pdfjs-dist");
const dest = join(root, "public", "pdfjs");

if (!existsSync(src)) {
  console.warn("[pdfjs] pdfjs-dist not installed, skipping");
  process.exit(0);
}
mkdirSync(dest, { recursive: true });
for (const dir of ["standard_fonts", "cmaps"]) {
  cpSync(join(src, dir), join(dest, dir), { recursive: true });
}
console.log("[pdfjs] copied standard_fonts and cmaps to public/pdfjs");
