import { Service } from "typedi";
import { AppDataSource } from "../config/data-source";
import { MessageRepo } from "../repositories/MessageRepo";
import { ConversationRepo } from "../repositories/ConversationRepo";
import { ParticipantRepo } from "../repositories/ParticipantRepo";
import { CallStatus, MessageType } from "../entities/Message";
import { Conversation } from "../entities/Conversation";
import { UserProps } from "../types/auth";
import { ForbiddenError } from "routing-controllers";
import { ChatCodeError } from "../constants/code";
import { emitConversationUpdate, emitNewMessage } from "../libs/io";

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
    sender: UserProps;
    content?: string;
    type?: MessageType;
    callDuration?: number;
    callStatus?: CallStatus;
  }) {
    const { conversationId, sender, content, type, callDuration, callStatus } =
      params;
    const senderId = sender.id;

    const participant = await this.participantRepo.findOne({
      where: { conversationId, userId: senderId },
    });

    if (!participant)
      throw new ForbiddenError(ChatCodeError.CANNOT_ACCESS_CONVERSATION);

    const message = await AppDataSource.transaction(async () => {
      const msg = await this.messageRepo.create({
        conversationId,
        senderId,
        content,
        type,
        callDuration,
        callStatus,
      });

      await this.conversationRepo.update(conversationId, {
        lastMessageId: msg.id,
        updatedAt: new Date(),
      });

      await this.participantRepo.incrementUnread(conversationId, senderId);

      return msg;
    });

    emitNewMessage(conversationId, {
      ...message,
      sender,
    });

    const updatedConversation = await this.conversationRepo.findOne({
      where: { id: conversationId },
      relations: [
        "participants",
        "participants.user",
        "lastMessage",
        "lastMessage.sender",
      ],
      select: {
        id: true,
        isGroup: true,
        participants: {
          id: true,
          userId: true,
          unreadCount: true,
          user: {
            id: true,
            fullName: true,
            avatar: true,
            username: true,
          },
        },
        lastMessage: {
          id: true,
          content: true,
          type: true,
          fileUrl: true,
          senderId: true,
          sender: {
            id: true,
            fullName: true,
            avatar: true,
            username: true,
          },
          createdAt: true,
        },
      },
    });

    if (updatedConversation) {
      const userIds = updatedConversation.participants.map((p) => p.userId);

      emitConversationUpdate(userIds, updatedConversation);
    }

    return message;
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
