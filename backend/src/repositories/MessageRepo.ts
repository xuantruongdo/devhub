import { Service } from "typedi";
import { AppDataSource } from "../config/data-source";
import { Message } from "../entities/Message";
import { MESSAGE_LIMIT } from "../constants";
import { UserProps } from "../types/auth";
import { ConversationParticipant } from "../entities/ConversationParticipant";
import { BaseRepo } from "./BaseRepo";

@Service()
export class MessageRepo extends BaseRepo<Message> {
  constructor() {
    super(Message, AppDataSource);
  }

  private participantRepo = AppDataSource.getRepository(
    ConversationParticipant,
  );

  async getMessages(
    conversationId: number,
    user: UserProps,
    options?: {
      limit?: number;
      cursor?: number;
      anchor?: number;
    },
  ) {
    const limit = options?.limit ?? MESSAGE_LIMIT;

    const qb = this.createQueryBuilder("m")
      .leftJoin("m.sender", "sender")
      .addSelect([
        "sender.id",
        "sender.email",
        "sender.username",
        "sender.fullName",
        "sender.avatar",
        "sender.isVerified",
      ])
      .where("m.conversationId = :conversationId", { conversationId })
      .orderBy("m.id", "DESC")
      .take(limit);

    if (options?.cursor) {
      qb.andWhere("m.id < :cursor", { cursor: options.cursor });
    }

    if (options?.anchor) {
      qb.andWhere("m.id <= :anchor", { anchor: options.anchor });
    }

    const messages = await qb.getMany();

    // MARK AS READ
    if (messages.length > 0) {
      const latestMessageId = messages[0].id;

      await this.participantRepo.update(
        {
          conversationId,
          userId: user.id,
        },
        {
          lastReadMessageId: latestMessageId,
          unreadCount: 0,
        },
      );
    }

    return messages;
  }
}
