"use client";

import { useParams } from "next/navigation";
import { getTranslations, defaultLocale } from "@/lib/i18n";
import type { Locale } from "@/types/i18n";
import React from "react";

type Translations = Awaited<ReturnType<typeof getTranslations>>;

function resolvePath(obj: any, path: string): string | undefined {
  return path.split(".").reduce((acc, key) => acc?.[key], obj);
}

export function useTranslation() {
  const params = useParams();
  const locale = ((params?.locale as string) || defaultLocale) as Locale;

  const [translations, setTranslations] = React.useState<Translations | null>(
    null,
  );

  React.useEffect(() => {
    setTranslations(null);
    getTranslations(locale).then(setTranslations);
  }, [locale]);

  const t = React.useCallback(
    (key: string, fallback?: string): string => {
      if (!translations) return fallback ?? key;
      return resolvePath(translations, key) ?? fallback ?? key;
    },
    [translations],
  );

  return { t, locale, ready: translations !== null };
}
