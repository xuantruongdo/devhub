"use client";

import Link from "next/link";
import moment from "moment";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Conversation, Message } from "@/types/chat";
import { useAppSelector } from "@/redux/hooks";
import { useTranslation } from "@/hooks/useTranslation";
import { formatFromNow, getOtherUser, getUnread, isMe } from "@/lib/utils";
import { CallEndReason, MessageType } from "@/constants";

type Props = {
  conversation: Conversation;
  onOpenConversation: (conversation: Conversation) => void;
};

export function MessageItem({ conversation, onOpenConversation }: Props) {
  const currentUser = useAppSelector((state) => state.currentUser);
  const { t, locale } = useTranslation();

  const otherUser = getOtherUser(conversation, currentUser.id);

  const displayName = conversation.isGroup
    ? conversation.title || t("chat.sidebar.unknown")
    : otherUser?.fullName;

  const avatarSrc = !conversation.isGroup ? otherUser?.avatar : null;

  const fallbackText = displayName?.charAt(0)?.toUpperCase() || "?";

  const unread = getUnread([conversation], currentUser.id);

  const renderLastMessage = (msg: Message) => {
    switch (msg.type) {
      case MessageType.CALL:
        switch (msg.callStatus) {
          case CallEndReason.REJECTED:
            return t("header.message.rejected");

          case CallEndReason.TIMEOUT:
            return t("header.message.missed");

          case CallEndReason.ENDED:
          default:
            return t("header.message.call");
        }

      case MessageType.FILE:
        return t("header.message.file");

      case MessageType.IMAGE:
        return t("header.message.image");

      case MessageType.TEXT:
      default:
        return msg.content;
    }
  };

  return (
    <Link
      href={`/${locale}/messages/${conversation.id}`}
      onClick={() => onOpenConversation(conversation)}
      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/60 transition-colors text-left border-b border-border/50 last:border-0"
    >
      <Avatar className="w-10 h-10">
        {avatarSrc ? (
          <AvatarImage src={avatarSrc} />
        ) : (
          <AvatarFallback>{fallbackText}</AvatarFallback>
        )}
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium truncate">
            {displayName || "Unknown"}
          </p>

          {unread > 0 && (
            <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
              {unread}
            </span>
          )}
        </div>

        <p className="text-sm text-gray-500 truncate">
          {conversation.lastMessage ? (
            <>
              {isMe(conversation.lastMessage.senderId, currentUser.id) &&
                conversation.lastMessage.type !== MessageType.CALL && (
                  <>{t("header.message.you")}: </>
                )}

              <span className="truncate inline-block max-w-[150px] align-bottom">
                {renderLastMessage(conversation.lastMessage)}
              </span>

              {" · "}
              <span className="text-[11px] text-gray-400 whitespace-nowrap">
                {formatFromNow(conversation.lastMessage.createdAt, locale)}
              </span>
            </>
          ) : (
            t("chat.sidebar.noMessages")
          )}
        </p>
      </div>
    </Link>
  );
}
