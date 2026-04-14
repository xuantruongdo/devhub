import { Service } from "typedi";
import { AppDataSource } from "../config/data-source";
import { ConversationParticipant } from "../entities/ConversationParticipant";
import { BaseRepo } from "./BaseRepo";

@Service()
export class ParticipantRepo extends BaseRepo<ConversationParticipant> {
  constructor() {
    super(ConversationParticipant, AppDataSource);
  }

  async findByUser(userId: number) {
    return this.createQueryBuilder("cp")

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

      .leftJoinAndSelect("c.lastMessage", "lm")

      .leftJoin("lm.sender", "lm_sender")
      .addSelect(["lm_sender.id", "lm_sender.username", "lm_sender.avatar"])

      .where("cp.userId = :userId", { userId })
      .orderBy("c.updatedAt", "DESC")
      .getMany();
  }

  async incrementUnread(conversationId: number, excludeUserId: number) {
    await this.createQueryBuilder()
      .update()
      .set({
        unreadCount: () => "unreadCount + 1",
      })
      .where("conversationId = :conversationId", { conversationId })
      .andWhere("userId != :excludeUserId", { excludeUserId })
      .execute();
  }
}
