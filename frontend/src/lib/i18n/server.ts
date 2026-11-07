import "server-only";
import { lang } from "next/root-params";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "./config";
import { getDictionary } from "./get-dictionary";

/** اللغة الحالية من مقطع [lang] في الرابط (Server Components فقط) */
export async function getLocale(): Promise<Locale> {
  const value = await lang();
  if (!isLocale(value)) notFound();
  return value;
}

/** اللغة والقاموس معًا */
export async function getI18n() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  return { locale, dict };
}
