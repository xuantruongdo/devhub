export const LIMIT = 10;
export const MESSAGE_LIMIT = 20;
export const FEED_SIZE = 20;

export enum FollowType {
  FOLLOWING = "followings",
  FOLLOWER = "followers",
}

export enum QueueName {
  EMAIL_QUEUE = "email-queue",
  NOTIFICATION_QUEUE = "notification-queue",
  USER_QUEUE = "user-queue",
}

export enum EmailJobName {
  SEND_VERIFY_EMAIL = "send-verify-email",
  SEND_RESET_PASSWORD = "send-reset-password",
  SEND_WELCOME_EMAIL = "send-welcome-email",
}

export enum NotificationJobName {
  LIKE_POST = "like_post",
  LIKE_COMMENT = "like_comment",
  COMMENT = "comment",
  FOLLOW = "follow",
}

export enum UserJobName {
  CREATE_USER_TO_ES = "create_user_to_es",
  UPDATE_USER_TO_ES = "update_user_to_es",
  DELETE_USER_FROM_ES = "delete_user_to_es",
}
