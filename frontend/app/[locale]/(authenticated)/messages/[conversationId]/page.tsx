"use client";

import ChatWindow from "@/components/Chat/ChatWindow";
import { useParams } from "next/navigation";

export const currentUserId = 1;
export const users = [
  {
    id: 1,
    fullName: "Bạn",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=You",
  },
  {
    id: 2,
    fullName: "Nguyễn Văn An",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=An",
  },
  {
    id: 3,
    fullName: "Trần Thị B",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bee",
  },
];
export const conversations = [
  { id: 1, isGroup: false },
  { id: 2, isGroup: false },
];
export const participants = [
  { id: 1, conversationId: 1, userId: 1, unreadCount: 0 },
  { id: 2, conversationId: 1, userId: 2, unreadCount: 2 },
  { id: 3, conversationId: 2, userId: 1, unreadCount: 0 },
  { id: 4, conversationId: 2, userId: 3, unreadCount: 1 },
];
export const messagesInit = [
  {
    id: 1,
    conversationId: 1,
    senderId: 2,
    content: "Hello bro 👋",
    createdAt: "10:00",
  },
  {
    id: 2,
    conversationId: 1,
    senderId: 1,
    content: "Hi 😎",
    createdAt: "10:01",
  },
  {
    id: 3,
    conversationId: 2,
    senderId: 3,
    content: "Hey bạn ơi",
    createdAt: "10:05",
  },
];

export default function ConversationPage() {
  const { conversationId } = useParams();

  // return <ChatWindow conversationId={Number(conversationId)} />;
  return <></>

}
