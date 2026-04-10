"use client";

import { ReactNode } from "react";
import { useParams } from "next/navigation";
import ChatSidebar from "@/components/Chat/ChatSidebar";

export default function MessagesLayout({ children }: { children: ReactNode }) {
  const { conversationId } = useParams();

  return (
    <div className="h-[calc(100vh-66px)] flex bg-background">
      <ChatSidebar activeId={Number(conversationId)} />

      <div className="flex-1">{children}</div>
    </div>
  );
}
