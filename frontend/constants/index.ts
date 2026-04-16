export const LIMIT = 10;
export const MESSAGE_LIMIT = 20;

export enum LocaleType {
  EN = "en",
  VI = "vi",
}

export enum ThemeType {
  LIGHT = "light",
  DARK = "dark",
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

export enum MessageType {
  TEXT = "text",
  IMAGE = "image",
  FILE = "file",
  CALL = "call",
}

export enum CallStatus {
  IDLE = "idle", // No active call
  CALLING = "calling", // User is calling someone
  RECEIVING = "receiving", // Incoming call
  CONNECTED = "connected", // Call is active (connected)
  ENDED = "ended", // Call has ended
}

export enum CallEndReason {
  REJECTED = "rejected", // Người nhận từ chối cuộc gọi
  TIMEOUT = "timeout", // Không ai bắt máy (hết thời gian chờ)
  ENDED = "ended", // Người dùng chủ động kết thúc cuộc gọi
}

export const TIMEOUT_RING = 30_000;

export enum CallState {
  IDLE = "idle",
  CALLING = "calling",
  INCOMING = "incoming",
  CONNECTED = "connected",
}

export const MAX_POST_CONTENT = 500;

export enum VerifyEmailStatus {
  LOADING = "loading",
  SUCCESS = "success",
  ERROR = "error",
}
