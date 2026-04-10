import { Service } from "typedi";
import { AppDataSource } from "../config/data-source";
import { MessageRepo } from "../repositories/MessageRepo";
import { ConversationRepo } from "../repositories/ConversationRepo";
import { ParticipantRepo } from "../repositories/ParticipantRepo";
import { Message } from "../entities/Message";
import { Conversation } from "../entities/Conversation";

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

    return await AppDataSource.transaction(async () => {
      const message = await this.messageRepo.create({
        conversationId,
        senderId,
        content,
      });

      await this.conversationRepo.update(conversationId, {
        updatedAt: new Date(),
      });

      // Tăng unread cho người khác
      await this.participantRepo.incrementUnread(conversationId, senderId);

      return message;
    });
  }

  async getMessages(
    conversationId: number,
    options?: {
      limit?: number;
      cursor?: number;
    },
  ) {
    return this.messageRepo.getMessages(conversationId, options);
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

    if (!participant) return true;

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
