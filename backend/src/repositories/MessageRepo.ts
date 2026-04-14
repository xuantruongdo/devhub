import { Service } from "typedi";
import { AppDataSource } from "../config/data-source";
import { Message } from "../entities/Message";
import { MESSAGE_LIMIT } from "../constants";
import { UserProps } from "../types/auth";
import { ConversationParticipant } from "../entities/ConversationParticipant";
import { FindOneOptions } from "typeorm";

@Service()
export class MessageRepo {
  private repo = AppDataSource.getRepository(Message);
  private participantRepo = AppDataSource.getRepository(
    ConversationParticipant,
  );

  async create(data: Partial<Message>) {
    const msg = this.repo.create(data);
    return this.repo.save(msg);
  }

  async getMessages(
    conversationId: number,
    user: UserProps,
    options?: {
      limit?: number;
      cursor?: number;
      anchor?: number;
    },
  ) {
    const limit = options?.limit || MESSAGE_LIMIT;

    const qb = this.repo
      .createQueryBuilder("m")
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

  async findOne(messageId: number, options?: FindOneOptions<Message>) {
    return this.repo.findOne({
      where: {
        id: messageId,
      },
      ...options,
    });
  }

  async findLastMessage(conversationId: number) {
    return this.repo.findOne({
      where: { conversationId },
      order: { id: "DESC" },
    });
  }
}
