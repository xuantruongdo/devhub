"use client";

import { toastError } from "@/lib/toast";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import chatService from "@/services/chat";
import { Conversation, Message } from "@/types/chat";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useTranslation } from "@/hooks/useTranslation";
import { ConversationSkeleton } from "./ConversationSkeleton";
import { CallEndReason, MessageType } from "@/constants";
import { formatFromNow, getOtherUser, getUnread, isMe } from "@/lib/utils";
import { setSelectedConversation } from "@/redux/reducers/conversation";

export default function ChatSidebar({ activeId }: { activeId: number | null }) {
  const router = useRouter();
  const { t, locale, ready } = useTranslation();
  const currentUser = useAppSelector((state) => state.currentUser);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);

        const { data } = await chatService.getMyConversations();

        setConversations(data.map((c) => c.conversation));
      } catch (error: any) {
        toastError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  useEffect(() => {
    if (!activeId || conversations.length === 0) return;

    const selected = conversations.find((c) => c.id === activeId);

    if (selected) {
      dispatch(setSelectedConversation(selected));
    }
  }, [activeId, conversations, dispatch]);

  const handleOpenConversation = (conversation: Conversation) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== conversation.id) return c;

        return {
          ...c,
          participants: c.participants.map((p) => {
            if (isMe(p.userId, currentUser.id)) {
              return { ...p, unreadCount: 0 };
            }
            return p;
          }),
        };
      }),
    );

    dispatch(setSelectedConversation(conversation));
    router.push(`/${locale}/messages/${conversation.id}`);
    window.scrollTo({ top: 0 });
  };

  const renderLastMessage = (msg: Message) => {
    switch (msg.type) {
      case MessageType.CALL:
        switch (msg.callStatus) {
          case CallEndReason.REJECTED:
            return t("chat.sidebar.message.rejected");

          case CallEndReason.TIMEOUT:
            return t("chat.sidebar.message.missed");

          case CallEndReason.ENDED:
          default:
            return t("chat.sidebar.message.call");
        }

      case MessageType.FILE:
        return t("chat.sidebar.message.file");

      case MessageType.IMAGE:
        return t("chat.sidebar.message.image");

      case MessageType.TEXT:
      default:
        return msg.content;
    }
  };

  if (!ready) return null;

  return (
    <div className="w-full md:w-80 border-r flex flex-col h-full">
      <div className="px-4 !py-[18px] font-semibold border-b">
        {t("chat.sidebar.messages")}
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div>
            {Array.from({ length: 6 }).map((_, i) => (
              <ConversationSkeleton key={i} />
            ))}
          </div>
        )}

        {conversations.length > 0 &&
          conversations.map((c) => {
            const otherUser = getOtherUser(c, currentUser.id);
            const unread = getUnread([c], currentUser.id);

            const displayName = c.isGroup ? c.title : otherUser?.fullName;

            const avatarSrc = !c.isGroup ? otherUser?.avatar : null;
            const fallbackText = displayName?.charAt(0);

            return (
              <button
                key={c.id}
                onClick={() => handleOpenConversation(c)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 text-left
                  hover:bg-muted/60 transition-colors cursor-pointer
                  ${activeId === c.id ? "bg-muted/60" : ""}
                `}
              >
                <Avatar className="w-10 h-10">
                  {avatarSrc ? (
                    <AvatarImage src={avatarSrc} />
                  ) : (
                    <AvatarFallback className="uppercase">
                      {fallbackText}
                    </AvatarFallback>
                  )}
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <p className="font-medium truncate">{displayName}</p>

                    {unread > 0 && (
                      <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                        {unread}
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-500 truncate">
                    {c.lastMessage ? (
                      <>
                        {isMe(c.lastMessage.senderId, currentUser.id) &&
                          c.lastMessage.type !== MessageType.CALL && (
                            <>{t("chat.sidebar.message.you")}: </>
                          )}

                        <span className="truncate inline-block max-w-[140px] align-bottom">
                          {renderLastMessage(c.lastMessage)}
                        </span>

                        {" · "}
                        <span className="text-[11px] text-gray-400 whitespace-nowrap">
                          {formatFromNow(c.lastMessage.createdAt, locale)}
                        </span>
                      </>
                    ) : (
                      t("chat.sidebar.noMessages")
                    )}
                  </p>
                </div>
              </button>
            );
          })}
      </div>
    </div>
  );
}
