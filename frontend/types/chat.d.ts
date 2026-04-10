import { MessageType } from "@/constants";
import { User } from "./user";

export interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  conversation: Conversation;
  sender: User;
  type: MessageType;
  content?: string;
  fileUrl?: string;
  createdAt: Date;
}

export interface Participant {
  id: number;
  conversationId: number;
  conversation: Conversation;
  userId: number;
  user: User;
  lastReadMessageId: number;
  unreadCount: number;
  isMuted: boolean;
}

export interface Conversation {
  id: number;
  isGroup: boolean;
  title?: string;
  participants: Participant[];
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationInput {
  userId: number;
}

export interface SendMessageInput {
  conversationId: number;
  content: string;
}
