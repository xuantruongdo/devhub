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

  // Sẽ fix sau
  const getUnread = (c: Conversation) => {
    const me = c.participants?.find((p) => p.userId === currentUser.id);

    const lastRead = me?.lastReadMessageId ?? 0;

    return (
      c.messages?.reduce((count, m) => {
        if (m.id > lastRead && m.senderId !== currentUser.id) {
          return count + 1;
        }
        return count;
      }, 0) ?? 0
    );
  };

  const getOtherUser = (c: Conversation) => {
    return c.participants.find((p) => p.userId !== currentUser.id)?.user;
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
                  onClick={() => {
                    router.push(`/${locale}/messages/${c.id}`);
                    window.scrollTo({ top: 0 });
                  }}
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
                      {t("chat.sidebar.noMessages")}
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
