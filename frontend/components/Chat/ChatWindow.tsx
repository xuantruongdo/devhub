"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Send } from "lucide-react";
import chatService from "@/services/chat";
import { useAppSelector } from "@/redux/hooks";
import { Message } from "@/types/chat";
import { MESSAGE_LIMIT } from "@/constants";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import moment from "moment";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { MessageSkeleton } from "./MessageSkeleton";
import { getOtherUser, isMe, isNearBottom, scrollToBottom } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";
import { toastError } from "@/lib/toast";
import { getSocket } from "@/lib/socket";

export default function ChatWindow({
  conversationId,
}: {
  conversationId: number;
}) {
  const currentUser = useAppSelector((state) => state.currentUser);
  const selectedConversation = useAppSelector((state) => state.conversation);

  const router = useRouter();
  const { t, locale, ready } = useTranslation();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [showNew, setShowNew] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const anchorRef = useRef<number | null>(null);
  const fetchingRef = useRef(false);
  const didInitialScroll = useRef(false);

  useEffect(() => {
    setMessages([]);
    setHasMore(true);
    anchorRef.current = null;
    didInitialScroll.current = false;
    setShowNew(false);

    fetchMessages();
  }, [conversationId]);

  const fetchMessages = async (cursor?: number) => {
    if (loading || fetchingRef.current) return;

    fetchingRef.current = true;
    setLoading(true);

    const el = containerRef.current;
    const prevScrollHeight = el?.scrollHeight || 0;

    try {
      const { data } = await chatService.getMessages(conversationId, {
        limit: MESSAGE_LIMIT,
        cursor,
        anchor: anchorRef.current ?? undefined,
      });

      let newMessages: Message[] = data;

      newMessages = newMessages.reverse();

      if (!anchorRef.current && newMessages.length > 0) {
        anchorRef.current = newMessages[newMessages.length - 1].id;
      }

      if (newMessages.length < MESSAGE_LIMIT) {
        setHasMore(false);
      }

      setMessages((prev) => {
        const merged = cursor ? [...newMessages, ...prev] : newMessages;
        return merged;
      });

      requestAnimationFrame(() => {
        if (!el) return;

        if (cursor) {
          const newScrollHeight = el.scrollHeight;
          el.scrollTop = newScrollHeight - prevScrollHeight;
        }
      });
    } catch (error: any) {
      toastError(t(`chat.response.${error}`));
      router.push(`/${locale}/messages`);
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  };

  useEffect(() => {
    if (!messages.length) return;
    if (didInitialScroll.current) return;

    const el = containerRef.current;
    if (!el) return;

    el.scrollTop = el.scrollHeight;

    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });

    didInitialScroll.current = true;
  }, [messages]);

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el || loading || !hasMore || fetchingRef.current) return;

    if (el.scrollTop <= 50) {
      const oldest = messages[0];
      if (oldest) fetchMessages(oldest.id);
    }

    if (isNearBottom(containerRef.current)) {
      setShowNew(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const temp: Partial<Message> = {
      id: Date.now(),
      conversationId,
      senderId: currentUser.id,
      content: input,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, temp as Message]);
    setInput("");

    requestAnimationFrame(() => {
      scrollToBottom(containerRef.current, true);
    });

    try {
      const { data } = await chatService.sendMessage({
        conversationId,
        content: temp.content || "",
      });

      setMessages((prev) => prev.map((m) => (m.id === temp.id ? data : m)));

      if (anchorRef.current && data.id > anchorRef.current) {
        anchorRef.current = data.id;
      }

      requestAnimationFrame(() => {
        scrollToBottom(containerRef.current, true);
      });
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== temp.id));
    }
  };

  const conversationName = useMemo(() => {
    const otherUser = getOtherUser(selectedConversation, currentUser.id);

    const displayName = selectedConversation.isGroup
      ? selectedConversation?.title || t("chat.sidebar.unknown")
      : otherUser?.fullName;

    return displayName;
  }, [conversationId, selectedConversation]);

  useEffect(() => {
    const socket = getSocket();

    // 1. join conversation room
    socket.emit("conversation:join", conversationId);

    // 2. handle new message
    const handleNewMessage = (message: Message) => {
      if (message.conversationId !== conversationId) return;

      if (isMe(message.senderId, currentUser.id)) return;

      setMessages((prev) => {
        const exists = prev.find((m) => m.id === message.id);
        if (exists) return prev;

        return [...prev, message];
      });

      requestAnimationFrame(() => {
        const el = containerRef.current;
        if (!el) return;

        const isBottom = isNearBottom(el);

        if (isBottom) {
          scrollToBottom(el, true);
        } else {
          setShowNew(true);
        }
      });
    };

    socket.on("message:new", handleNewMessage);

    // cleanup
    return () => {
      socket.off("message:new", handleNewMessage);

      // optional: leave room (không bắt buộc nhưng tốt)
      // socket.emit("conversation:leave", conversationId);
    };
  }, [conversationId]);

  if (!ready) return null;

  return (
    <div className="flex flex-col h-full min-h-0 relative">
      <div className="md:hidden flex items-center justify-between p-3 border-b shrink-0">
        <div className="flex items-center gap-2">
          <button onClick={() => router.push(`/${locale}/messages`)}>
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="font-medium">{t("chat.window.title")}</span>
        </div>
        <span className="font-medium">{conversationName}</span>
      </div>

      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0"
      >
        {messages.map((m) => {
          const isMine = isMe(m.senderId, currentUser.id);

          return (
            <div key={m.id} className="space-y-1">
              <div
                className={`flex items-end gap-2 ${
                  isMine ? "justify-end" : "justify-start"
                }`}
              >
                {!isMine && (
                  <Avatar size="lg" className="cursor-pointer">
                    {m.sender?.avatar ? (
                      <AvatarImage
                        src={m.sender?.avatar}
                        alt={m.sender.fullName}
                      />
                    ) : (
                      <AvatarFallback>
                        {m.sender.fullName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                )}

                <div
                  className={`px-3 py-2 rounded-2xl max-w-[70%] text-sm ${
                    isMine
                      ? "bg-blue-500 text-white"
                      : "bg-white text-black border"
                  }`}
                >
                  {m.content}
                </div>
              </div>

              <div
                className={`text-[11px] text-gray-400 ${
                  isMine ? "text-right pr-1" : "pl-2"
                }`}
              >
                {!isMine && m.sender?.fullName && (
                  <div className="text-gray-500 text-[10px]">
                    {m.sender.fullName}
                  </div>
                )}

                {moment(m.createdAt).format("HH:mm")}
              </div>
            </div>
          );
        })}

        {loading && (
          <>
            <MessageSkeleton />
            <MessageSkeleton isMine />
            <MessageSkeleton />
          </>
        )}
      </div>

      {showNew && (
        <button
          onClick={() => {
            scrollToBottom(containerRef.current, true);
            setShowNew(false);
          }}
          className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-xs shadow"
        >
          {t("chat.window.newMessages")}
        </button>
      )}

      <div className="p-3 border-t flex gap-2 shrink-0">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("chat.window.typeMessage")}
          className="flex-1 rounded-full"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
        />

        <Button onClick={handleSend} size="icon">
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
