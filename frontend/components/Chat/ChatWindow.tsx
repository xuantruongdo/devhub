"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Phone, PhoneOff, Send, Video } from "lucide-react";
import chatService from "@/services/chat";
import { useAppSelector } from "@/redux/hooks";
import { Message } from "@/types/chat";
import { CallEndReason, MESSAGE_LIMIT, MessageType } from "@/constants";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import moment from "moment";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { MessageSkeleton } from "./MessageSkeleton";
import {
  formatCallDuration,
  getOtherUser,
  isMe,
  scrollToBottom,
} from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";
import { toastError } from "@/lib/toast";
import { getSocket } from "@/lib/socket";
import Link from "next/link";
import { useCallContext } from "@/contexts/CallContext";

export default function ChatWindow({
  conversationId,
}: {
  conversationId: number;
}) {
  const currentUser = useAppSelector((state) => state.currentUser);
  const selectedConversation = useAppSelector((state) => state.conversation);

  const router = useRouter();
  const { t, locale, ready } = useTranslation();
  const socket = getSocket();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [showNew, setShowNew] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const anchorRef = useRef<number | null>(null);
  const fetchingRef = useRef(false);
  const didInitialScroll = useRef(false);
  const incomingMessageRef = useRef(false);

  const { startCall } = useCallContext();

  useEffect(() => {
    setMessages([]);
    setHasMore(true);
    anchorRef.current = null;
    didInitialScroll.current = false;
    incomingMessageRef.current = false;
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
        return cursor ? [...newMessages, ...prev] : newMessages;
      });

      if (cursor && el) {
        // Dùng rAF ở đây vẫn cần: để đợi DOM render xong rồi mới restore scroll position
        requestAnimationFrame(() => {
          const newScrollHeight = el.scrollHeight;
          el.scrollTop = newScrollHeight - prevScrollHeight;
        });
      }
    } catch (error: any) {
      toastError(t(`chat.response.${error}`));
      router.push(`/${locale}/messages`);
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  };

  // Scroll xuống cuối sau lần fetch đầu tiên
  useEffect(() => {
    if (!messages.length) return;
    if (didInitialScroll.current) return;

    const el = containerRef.current;
    if (!el) return;

    el.scrollTop = el.scrollHeight;
    didInitialScroll.current = true;
  }, [messages]);

  // Xử lý scroll khi có tin nhắn mới từ người khác (sau khi DOM đã render xong)
  useEffect(() => {
    if (!incomingMessageRef.current) return;
    incomingMessageRef.current = false;

    const el = containerRef.current;
    if (!el) return;

    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const threshold = el.clientHeight * 0.5; // 50% chiều cao container

    if (distanceFromBottom < threshold) {
      scrollToBottom(el, true);
    } else {
      setShowNew(true);
    }
  }, [messages]);

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el || loading || !hasMore || fetchingRef.current) return;

    if (el.scrollTop <= 50) {
      const oldest = messages[0];
      if (oldest) fetchMessages(oldest.id);
    }

    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const threshold = el.clientHeight * 0.5;

    if (distanceFromBottom < threshold) {
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

    scrollToBottom(containerRef.current, true);

    try {
      const { data } = await chatService.sendMessage({
        conversationId,
        content: temp.content || "",
      });

      setMessages((prev) => prev.map((m) => (m.id === temp.id ? data : m)));

      if (anchorRef.current && data.id > anchorRef.current) {
        anchorRef.current = data.id;
      }

      scrollToBottom(containerRef.current, true);
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== temp.id));
    }
  };

  const otherUser = useMemo(() => {
    if (selectedConversation?.isGroup) return null;

    return getOtherUser(selectedConversation, currentUser.id);
  }, [selectedConversation, currentUser.id]);

  const conversationName = useMemo(() => {
    if (selectedConversation?.isGroup) {
      return selectedConversation?.title || t("chat.sidebar.unknown");
    }

    return otherUser?.fullName;
  }, [
    selectedConversation?.isGroup,
    selectedConversation?.title,
    otherUser,
    t,
  ]);

  useEffect(() => {
    socket.emit("conversation:join", conversationId);

    const handleNewMessage = (message: Message) => {
      if (message.conversationId !== conversationId) return;
      if (isMe(message.senderId, currentUser.id)) return;

      setMessages((prev) => {
        const exists = prev.find((m) => m.id === message.id);
        if (exists) return prev;

        incomingMessageRef.current = true;
        return [...prev, message];
      });
    };

    socket.on("message:new", handleNewMessage);

    return () => {
      socket.off("message:new", handleNewMessage);

      // optional: leave room (không bắt buộc nhưng tốt)
      // socket.emit("conversation:leave", conversationId);
    };
  }, [conversationId]);

  const renderMessageContent = (m: Message, isMine: boolean) => {
    switch (m.type) {
      case MessageType.CALL:
        const isMissed =
          m.callStatus === CallEndReason.REJECTED ||
          m.callStatus === CallEndReason.TIMEOUT;

        return (
          <div
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-sm border ${
              isMine
                ? "bg-blue-50 border-blue-200 text-blue-700"
                : "bg-gray-50 border-gray-200 text-gray-700"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                isMissed ? "bg-red-100" : "bg-green-100"
              }`}
            >
              {isMissed ? (
                <PhoneOff className="w-4 h-4 text-red-500" />
              ) : (
                <Phone className="w-4 h-4 text-green-600" />
              )}
            </div>

            <div className="flex flex-col min-w-0">
              <span className="font-medium leading-tight">{m.content}</span>

              {m.callDuration > 0 && (
                <span className="text-[11px] opacity-60 mt-0.5">
                  {formatCallDuration(m.callDuration)}
                </span>
              )}
            </div>
          </div>
        );

      case MessageType.TEXT:
      default:
        return (
          <div
            className={`px-3 py-2 rounded-2xl max-w-[70%] text-sm ${
              isMine ? "bg-blue-500 text-white" : "bg-white text-black border"
            }`}
          >
            {m.content}
          </div>
        );
    }
  };

  if (!ready) return null;

  return (
    <div className="flex flex-col h-full min-h-0 relative">
      <div className="flex items-center justify-between p-3 border-b shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push(`/${locale}/messages`)}
            className="md:hidden"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {!selectedConversation?.isGroup && otherUser && (
            <Link href={`/${locale}/${otherUser.username}`}>
              <Avatar size="lg" className="hidden md:block">
                {otherUser.avatar ? (
                  <AvatarImage
                    src={otherUser.avatar}
                    alt={otherUser.fullName}
                  />
                ) : (
                  <AvatarFallback>
                    {otherUser.fullName?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
            </Link>
          )}

          <div className="flex flex-col">
            <span className="font-medium">{conversationName}</span>

            {!selectedConversation?.isGroup && (
              <span className="text-xs text-gray-400 hidden md:block">
                Online
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {otherUser && (
            <button
              onClick={() => startCall(otherUser.id, currentUser.fullName)}
              className="w-9 h-9 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80"
            >
              <Video className="w-5 h-5 " />
            </button>
          )}
        </div>
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
                        src={m.sender.avatar}
                        alt={m.sender.fullName}
                      />
                    ) : (
                      <AvatarFallback>
                        {m.sender.fullName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                )}
                {renderMessageContent(m, isMine)}
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
