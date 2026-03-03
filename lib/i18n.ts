import type { Locale } from "@/types/i18n";

export const locales = ["es", "en"] as const;
export const defaultLocale: Locale = "es";

export async function getDictionary(locale: Locale) {
  const dict = await import(`@/locales/${locale}.json`);
  return dict.default;
}

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}
