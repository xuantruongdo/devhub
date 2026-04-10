import { NotificationType } from "@/constants";
import { User } from "./user";

export interface Notification {
  id: number;
  recipientId: number;
  senderId: number;
  sender: User;
  type: NotificationType;
  postId?: number;
  commentId?: number;
  isRead: boolean;
  createdAt: Date;
}
