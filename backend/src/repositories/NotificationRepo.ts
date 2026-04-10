import { Service } from "typedi";
import { AppDataSource } from "../config/data-source";
import { Notification } from "../entities/Notification";

@Service()
export class NotificationRepo {
  private repo = AppDataSource.getRepository(Notification);

  async findById(id: number) {
    return this.repo.findOne({
      where: { id },
      relations: ["sender"],
      select: {
        id: true,
        type: true,
        isRead: true,
        createdAt: true,
        postId: true,
        commentId: true,

        sender: {
          id: true,
          username: true,
          fullName: true,
          isVerified: true,
        },
      },
    });
  }

  async getUserNotifications(
    userId: number,
    options?: {
      limit?: number;
      cursor?: number;
    },
  ) {
    const { limit = 20, cursor } = options || {};

    const qb = this.repo
      .createQueryBuilder("n")
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
    return this.repo.count({
      where: {
        recipientId: userId,
        isRead: false,
      },
    });
  }

  async save(notification: Notification): Promise<Notification> {
    return this.repo.save(notification);
  }

  async create(data: Partial<Notification>) {
    const notification = this.repo.create(data);
    return this.save(notification);
  }

  async update(id: number, data: Partial<Notification>) {
    await this.repo.update(id, data);
    return this.repo.findOne({ where: { id } });
  }

  async updateMany(where: Partial<Notification>, data: Partial<Notification>) {
    return this.repo.update(where, data);
  }

  async remove(id: number) {
    return this.repo.delete(id);
  }
}
