import localFont from "next/font/local";

/*
 * الخطوط مستضافة داخل المشروع (next/font/local) بدل Google Fonts:
 * البناء لا يحتاج إنترنت، ولا تُرسل بيانات الزوار إلى طرف ثالث.
 * كل خط مقسوم إلى ملف لاتيني وملف عربي؛ نرتبهما في --font-sans
 * (globals.css) فيأخذ المتصفح كل حرف من الملف المناسب.
 */

export const uiLatin = localFont({
  src: [
    { path: "./plex-latin-400.woff2", weight: "400" },
    { path: "./plex-latin-500.woff2", weight: "500" },
    { path: "./plex-latin-600.woff2", weight: "600" },
    { path: "./plex-latin-700.woff2", weight: "700" },
  ],
  variable: "--font-ui-latin",
  display: "swap",
});

export const uiArabic = localFont({
  src: [
    { path: "./plex-arabic-400.woff2", weight: "400" },
    { path: "./plex-arabic-500.woff2", weight: "500" },
    { path: "./plex-arabic-600.woff2", weight: "600" },
    { path: "./plex-arabic-700.woff2", weight: "700" },
  ],
  variable: "--font-ui-arabic",
  display: "swap",
});

/** عناوين العربية: Amiri (نسخ كلاسيكي بطابع أدبي) */
export const displayArabic = localFont({
  src: [
    { path: "./amiri-arabic-400.woff2", weight: "400" },
    { path: "./amiri-arabic-700.woff2", weight: "700" },
  ],
  variable: "--font-display-arabic",
  display: "swap",
});

export const displayArabicLatin = localFont({
  src: [
    { path: "./amiri-latin-400.woff2", weight: "400" },
    { path: "./amiri-latin-700.woff2", weight: "700" },
  ],
  variable: "--font-display-arabic-latin",
  display: "swap",
  preload: false,
});

/** عناوين الإنجليزية: Fraunces */
export const displayLatin = localFont({
  src: [
    { path: "./fraunces-600.woff2", weight: "600" },
    { path: "./fraunces-700.woff2", weight: "700" },
  ],
  variable: "--font-display-latin",
  display: "swap",
  preload: false,
});

export const fontVariables = [uiLatin, uiArabic, displayArabic, displayArabicLatin, displayLatin].map((f) => f.variable).join(" ");
