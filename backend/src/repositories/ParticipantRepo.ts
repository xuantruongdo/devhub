import { Service } from "typedi";
import { AppDataSource } from "../config/data-source";
import { ConversationParticipant } from "../entities/ConversationParticipant";

@Service()
export class ParticipantRepo {
  private repo = AppDataSource.getRepository(ConversationParticipant);

  async create(data: Partial<ConversationParticipant>) {
    const p = this.repo.create(data);
    return this.repo.save(p);
  }

  async findByUser(userId: number) {
    return (
      this.repo
        .createQueryBuilder("cp")

        .leftJoinAndSelect("cp.conversation", "c")
        .leftJoinAndSelect("c.participants", "p")

        .leftJoin("p.user", "u")

        .addSelect([
          "u.id",
          "u.username",
          "u.email",
          "u.fullName",
          "u.avatar",
          "u.isVerified",
        ])

        .where("cp.userId = :userId", { userId })
        .orderBy("c.updatedAt", "DESC")
        .getMany()
    );
  }

  async findOne(conversationId: number, userId: number) {
    return this.repo.findOne({
      where: { conversationId, userId },
    });
  }

  async update(id: number, data: Partial<ConversationParticipant>) {
    await this.repo.update(id, data);
    return this.repo.findOne({ where: { id } });
  }

  async incrementUnread(conversationId: number, excludeUserId: number) {
    await this.repo
      .createQueryBuilder()
      .update()
      .set({
        unreadCount: () => "unreadCount + 1",
      })
      .where("conversationId = :conversationId", { conversationId })
      .andWhere("userId != :excludeUserId", { excludeUserId })
      .execute();
  }

  async resetUnread(conversationId: number, userId: number) {
    await this.repo.update({ conversationId, userId }, { unreadCount: 0 });
  }

  async findByConversationAndUser(conversationId: number, userId: number) {
    return this.repo.findOne({
      where: {
        conversationId,
        userId,
      },
    });
  }
}
