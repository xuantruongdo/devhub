"use client";

import ChatWindow from "@/components/Chat/ChatWindow";
import { useParams } from "next/navigation";

export default function ConversationPage() {
  const { conversationId } = useParams();

  return <ChatWindow conversationId={Number(conversationId)} />;
}
