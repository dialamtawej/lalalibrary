export const locales = ["ar", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "ar";
export const LOCALE_COOKIE = "lala_locale";

export const localeMeta: Record<Locale, { dir: "rtl" | "ltr"; label: string; intl: string }> = {
  ar: { dir: "rtl", label: "العربية", intl: "ar-SY" },
  en: { dir: "ltr", label: "English", intl: "en-GB" },
};

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}

/** يستبدل {name} في النص بالقيمة المقابلة */
export function format(template: string, vars: Record<string, string | number> = {}): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    key in vars ? String(vars[key]) : `{${key}}`,
  );
}
