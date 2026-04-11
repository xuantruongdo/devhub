"use client";

import { toastError } from "@/lib/toast";
import { useAppSelector } from "@/redux/hooks";
import chatService from "@/services/chat";
import { Conversation } from "@/types/chat";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useTranslation } from "@/hooks/useTranslation";
import { ConversationSkeleton } from "./ConversationSkeleton";
import { MessageType } from "@/constants";
import moment from "moment";
import { isMe } from "@/lib/utils";

export default function ChatSidebar({ activeId }: { activeId: number | null }) {
  const router = useRouter();
  const { t, locale, ready } = useTranslation();
  const currentUser = useAppSelector((state) => state.currentUser);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);

        const { data } = await chatService.getMyConversations();

        const uniqueConversations = Array.from(
          new Map(
            data.map((p: any) => [p.conversation.id, p.conversation]),
          ).values(),
        );

        setConversations(uniqueConversations);
      } catch (error: any) {
        toastError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  const getUnread = (c: Conversation) => {
    const me = c.participants?.find((p) => isMe(p.userId, currentUser.id));

    return me?.unreadCount ?? 0;
  };

  const getOtherUser = (c: Conversation) => {
    return c.participants.find((p) => !isMe(p.userId, currentUser.id))?.user;
  };

  const handleOpenConversation = (conversationId: number) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== conversationId) return c;

        return {
          ...c,
          participants: c.participants.map((p) => {
            if (isMe(p.userId, currentUser.id)) {
              return {
                ...p,
                unreadCount: 0,
              };
            }
            return p;
          }),
        };
      }),
    );

    router.push(`/${locale}/messages/${conversationId}`);
    window.scrollTo({ top: 0 });
  };

  if (!ready) return null;

  return (
    <div className="w-full md:w-80 border-r flex flex-col h-full">
      <div className="p-4 font-semibold border-b">
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
        {conversations.length > 0
          ? conversations.map((c) => {
              const otherUser = getOtherUser(c);
              const unread = getUnread(c);

              const displayName = c.isGroup
                ? c.title || t("chat.sidebar.unknown")
                : otherUser?.fullName;

              const avatarSrc = !c.isGroup ? otherUser?.avatar : null;

              const fallbackText = displayName?.charAt(0)?.toUpperCase() || "?";

              return (
                <button
                  key={c.id}
                  onClick={() => handleOpenConversation(c.id)}
                  className={`
                  w-full flex items-center gap-3 px-4 py-3 text-left
                  hover:bg-gray-100 dark:hover:bg-white/10
                  cursor-pointer transition-colors
                  ${activeId === c.id ? "bg-gray-100 dark:bg-white/10" : ""}
                `}
                >
                  <Avatar className="w-10 h-10">
                    {avatarSrc ? (
                      <AvatarImage src={avatarSrc} />
                    ) : (
                      <AvatarFallback>{fallbackText}</AvatarFallback>
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
                          {isMe(c.lastMessage.senderId, currentUser.id) && (
                            <>{t("chat.sidebar.you")}: </>
                          )}

                          <span className="truncate inline-block max-w-[100px] align-bottom">
                            {c.lastMessage.type === MessageType.TEXT
                              ? c.lastMessage.content
                              : t("chat.sidebar.file")}
                          </span>

                          {" · "}
                          <span className="text-[11px] text-gray-400 whitespace-nowrap">
                            {moment(c.lastMessage.createdAt).fromNow()}
                          </span>
                        </>
                      ) : (
                        t("chat.sidebar.noMessages")
                      )}
                    </p>
                  </div>
                </button>
              );
            })
          : null}
      </div>
    </div>
  );
}
