import { getIO } from "../config/socket";
import { Conversation } from "../entities/Conversation";
import { Notification } from "../entities/Notification";
import { MessageWithSender, NotificationWithSender } from "../types/socket";

export const SocketEvents = {
  MESSAGE_NEW: "message:new",
  CONVERSATION_UPDATE: "conversation:update",
  NOTIFICATION_NEW: "notification:new",
} as const;

export const emitNewMessage = (
  conversationId: number,
  message: MessageWithSender,
) => {
  const io = getIO();

  io.to(`conversation:${conversationId}`).emit(SocketEvents.MESSAGE_NEW, {
    ...message,
    conversationId,
  });
};

export const emitConversationUpdate = (
  userIds: number[],
  conversation: Conversation,
) => {
  const io = getIO();

  userIds.forEach((userId) => {
    io.to(`user:${userId}`).emit(
      SocketEvents.CONVERSATION_UPDATE,
      conversation,
    );
  });
};

export const emitNewNotification = (
  userId: number,
  notification: NotificationWithSender,
) => {
  const io = getIO();

  io.to(`user:${userId}`).emit(SocketEvents.NOTIFICATION_NEW, notification);
};
