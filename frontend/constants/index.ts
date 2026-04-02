export const LIMIT = 10;

export enum LocaleType {
  EN = "en",
  VI = "vi",
}
export const LOCALE_LABELS: Record<string, string> = {
  en: "English",
  vi: "Tiếng Việt",
};

export enum ThemeType {
  LIGHT = "light",
  DARK = "dark",
  SYSTEM = "system",
}

export enum PostVisibility {
  PUBLIC = "public",
  PRIVATE = "private",
}
