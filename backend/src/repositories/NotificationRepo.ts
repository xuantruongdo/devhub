import { Service } from "typedi";
import { AppDataSource } from "../config/data-source";
import { Notification } from "../entities/Notification";
import { BaseRepo } from "./BaseRepo";

@Service()
export class NotificationRepo extends BaseRepo<Notification> {
  constructor() {
    super(Notification, AppDataSource);
  }

  async getUserNotifications(
    userId: number,
    options?: {
      limit?: number;
      cursor?: number;
    },
  ) {
    const { limit = 20, cursor } = options || {};

    const qb = this.createQueryBuilder("n")
      .leftJoin("n.sender", "sender")
      .addSelect([
        "sender.id",
        "sender.username",
        "sender.fullName",
        "sender.isVerified",
        "sender.avatar",
      ])
      .where("n.recipientId = :userId", { userId })
      .orderBy("n.id", "DESC")
      .limit(limit);

    if (cursor) {
      qb.andWhere("n.id < :cursor", { cursor });
    }

    return qb.getMany();
  }

  async getUnreadCount(userId: number): Promise<number> {
    return this.count({
      where: {
        recipientId: userId,
        isRead: false,
      },
    });
  }

  async updateMany(where: Partial<Notification>, data: Partial<Notification>) {
    return this.update(where, data);
  }
}
