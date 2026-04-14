import { Service } from "typedi";
import { NotificationRepo } from "../repositories/NotificationRepo";
import { NotificationType } from "../entities/Notification";

@Service()
export class NotificationService {
  constructor(private readonly notificationRepo: NotificationRepo) {}

  async create(params: {
    recipientId: number;
    senderId: number;
    type: NotificationType;
    postId?: number;
    commentId?: number;
  }) {
    const { recipientId, senderId } = params;

    if (recipientId === senderId) return null;

    return this.notificationRepo.save({
      ...params,
      isRead: false,
    });
  }

  async getUserNotifications(
    userId: number,
    options?: {
      limit?: number;
      cursor?: number;
    },
  ) {
    return this.notificationRepo.getUserNotifications(userId, options);
  }

  async getUnreadCount(userId: number) {
    return this.notificationRepo.getUnreadCount(userId);
  }

  async markAsRead(userId: number, notificationId: number) {
    return this.notificationRepo.updateMany(
      {
        id: notificationId,
        recipientId: userId,
      },
      {
        isRead: true,
      },
    );
  }

  async markAllAsRead(userId: number) {
    await this.notificationRepo.updateMany(
      { recipientId: userId, isRead: false },
      { isRead: true },
    );

    return true;
  }

  async remove(id: number) {
    return this.notificationRepo.delete(id);
  }
}
