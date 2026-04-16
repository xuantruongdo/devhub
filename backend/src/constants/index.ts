export const LIMIT = 10;
export const MESSAGE_LIMIT = 20;

export enum FollowType {
  FOLLOWING = "followings",
  FOLLOWER = "followers",
}

export enum QueueName {
  EMAIL_QUEUE = "email-queue",
}

export enum EmailJobName {
  SEND_VERIFY_EMAIL = "send-verify-email",
  SEND_RESET_PASSWORD = "send-reset-password",
  SEND_WELCOME_EMAIL = "send-welcome-email",
}
