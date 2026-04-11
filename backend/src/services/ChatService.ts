import { Service } from "typedi";
import { AppDataSource } from "../config/data-source";
import { MessageRepo } from "../repositories/MessageRepo";
import { ConversationRepo } from "../repositories/ConversationRepo";
import { ParticipantRepo } from "../repositories/ParticipantRepo";
import { Message } from "../entities/Message";
import { Conversation } from "../entities/Conversation";
import { UserProps } from "../types/auth";
import { ForbiddenError } from "routing-controllers";
import { ChatCodeError } from "../constants/code";

@Service()
export class ChatService {
  constructor(
    private messageRepo: MessageRepo,
    private conversationRepo: ConversationRepo,
    private participantRepo: ParticipantRepo,
  ) {}

  // Tạo conversation 1-1
  async accessConversation(userA: number, userB: number) {
    return await AppDataSource.transaction(async (manager) => {
      // tìm conversation đã tồn tại
      const existing = await manager
        .createQueryBuilder(Conversation, "c")
        .innerJoin(
          "conversation_participant",
          "cp1",
          "cp1.conversationId = c.id AND cp1.userId = :userA",
          { userA },
        )
        .innerJoin(
          "conversation_participant",
          "cp2",
          "cp2.conversationId = c.id AND cp2.userId = :userB",
          { userB },
        )
        .where("c.isGroup = false")
        .getOne();

      if (existing) {
        return existing;
      }

      // chưa có thì tạo mới
      const convo = await manager.save(Conversation, {
        isGroup: false,
      });

      await manager.save("ConversationParticipant", [
        { conversationId: convo.id, userId: userA },
        { conversationId: convo.id, userId: userB },
      ]);

      return convo;
    });
  }

  async sendMessage(params: {
    conversationId: number;
    senderId: number;
    content: string;
  }) {
    const { conversationId, senderId, content } = params;

    const participant = await this.participantRepo.findOne({
      where: {
        conversationId,
        userId: senderId,
      },
    });

    if (!participant)
      throw new ForbiddenError(ChatCodeError.CANNOT_ACCESS_CONVERSATION);

    return await AppDataSource.transaction(async () => {
      const message = await this.messageRepo.create({
        conversationId,
        senderId,
        content,
      });

      // Update conversation (lastMessage + updatedAt)
      await this.conversationRepo.update(conversationId, {
        lastMessageId: message.id,
        updatedAt: new Date(),
      });

      // Tăng unread cho người khác
      await this.participantRepo.incrementUnread(conversationId, senderId);

      return message;
    });
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
    const participant = await this.participantRepo.findOne({
      where: {
        conversationId,
        userId: user.id,
      },
    });

    if (!participant)
      throw new ForbiddenError(ChatCodeError.CANNOT_ACCESS_CONVERSATION);

    return this.messageRepo.getMessages(conversationId, user, options);
  }

  async markAsRead(conversationId: number, userId: number) {
    // Lấy last message
    const lastMessage = await this.messageRepo.findLastMessage(conversationId);

    if (!lastMessage) return true;

    // Tìm participant
    const participant = await this.participantRepo.findByConversationAndUser(
      conversationId,
      userId,
    );

    if (!participant)
      throw new ForbiddenError(ChatCodeError.CANNOT_ACCESS_CONVERSATION);

    await this.participantRepo.update(participant.id, {
      lastReadMessageId: lastMessage.id,
      unreadCount: 0,
    });

    return true;
  }

  async getUserConversations(userId: number) {
    return this.participantRepo.findByUser(userId);
  }
}
