"use client";

import { ReactNode } from "react";
import { useParams } from "next/navigation";
import ChatSidebar from "@/components/Chat/ChatSidebar";

export default function MessagesLayout({ children }: { children: ReactNode }) {
  const { conversationId } = useParams();

  const hasConversation = !!conversationId;

  return (
    <div className="h-[calc(100dvh-66px)] max-h-[calc(100dvh-66px)] flex bg-background overflow-hidden">
      <div
        className={`
          w-full md:w-80 border-r flex flex-col min-h-0
          ${hasConversation ? "hidden md:flex" : "flex"}
        `}
      >
        <ChatSidebar activeId={Number(conversationId)} />
      </div>

      <div
        className={`
          flex-1 min-h-0
          ${!hasConversation ? "hidden md:block" : "block"}
        `}
      >
        {children}
      </div>
    </div>
  );
}
