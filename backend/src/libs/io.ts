import { getIO } from "../config/socket";
import { Message } from "../entities/Message";

export const SocketEvents = {
  MESSAGE_NEW: "message:new",
  CONVERSATION_UPDATE: "conversation:update",
} as const;

export const emitNewMessage = (conversationId: number, message: Message) => {
  const io = getIO();

  io.to(`conversation:${conversationId}`).emit(SocketEvents.MESSAGE_NEW, {
    ...message,
    conversationId,
  });
};
