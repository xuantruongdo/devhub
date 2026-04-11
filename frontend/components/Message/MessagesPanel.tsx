"use client";

import { useRef } from "react";
import { X } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { Conversation } from "@/types/chat";
import { useAppSelector } from "@/redux/hooks";
import Link from "next/link";
import { MessageItem } from "./MessageItem";

export function MessagesPanel({
  open,
  onClose,
  conversations,
  unreadCount,
  loading,
  onOpenConversation,
}: {
  open: boolean;
  onClose: () => void;
  conversations: Conversation[];
  unreadCount: number;
  loading: boolean;
  onOpenConversation: (conversation: Conversation) => void;
}) {
  const { t, locale } = useTranslation();
  const containerRef = useRef<HTMLDivElement | null>(null);

  if (!open) return null;

  return (
    <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm">
            {t("chat.sidebar.messages")}
          </h3>

          {unreadCount > 0 && (
            <span className="text-xs bg-primary text-primary-foreground rounded-full px-2.5 py-1">
              {unreadCount}
            </span>
          )}
        </div>

        <button onClick={onClose} className="p-1 hover:bg-muted rounded-full">
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      <div ref={containerRef} className="max-h-[400px] overflow-y-auto">
        {conversations.map((c) => (
          <MessageItem
            key={c.id}
            conversation={c}
            onOpenConversation={onOpenConversation}
          />
        ))}
      </div>

      <div className="px-4 py-2 border-t border-border">
        <Link
          href={`/${locale}/messages/${conversations[0].id}`}
          onClick={onClose}
          className="flex w-full justify-center text-xs text-primary hover:underline"
        >
          {t("chat.sidebar.viewAll")} →
        </Link>
      </div>
    </div>
  );
}
