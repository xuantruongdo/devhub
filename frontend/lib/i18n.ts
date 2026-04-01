import type { Locale } from "@/types/i18n";

export const locales: Locale[] = ["en", "vi"];
export const defaultLocale: Locale = "en";

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

// cache để tránh import lại nhiều lần
const cache = new Map<Locale, Record<string, string>>();

export async function getTranslations(locale: Locale) {
  // cache hit
  if (cache.has(locale)) {
    return cache.get(locale)!;
  }

  try {
    const translations = await import(`@/locales/${locale}.json`).then(
      (m) => m.default,
    );

    cache.set(locale, translations);
    return translations;
  } catch {
    const fallback = await import(`@/locales/${defaultLocale}.json`).then(
      (m) => m.default,
    );

    cache.set(defaultLocale, fallback);
    return fallback;
  }
}
