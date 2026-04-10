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

export const MAX_COUNT_FILE = 5;

export enum UserRole {
  ADMIN = "admin",
  USER = "user",
}

export enum FollowType {
  FOLLOWING = "followings",
  FOLLOWER = "followers",
}

export enum NotificationType {
  LIKE_POST = "like_post",
  LIKE_COMMENT = "like_comment",
  COMMENT = "comment",
  FOLLOW = "follow",
}
