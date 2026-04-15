"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, PhoneOff, Send, Video } from "lucide-react";
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
  formatDuration,
  getOtherUser,
  isMe,
  scrollToBottom,
} from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";
import { toastError } from "@/lib/toast";
import { useVideoCallContext } from "@/contexts/VideoCallContext";
import { useSocketContext } from "@/contexts/SocketContext";
import Link from "next/link";

const NAVBAR_HEIGHT = 64;
const CHAT_HEADER_HEIGHT = 57;
const INPUT_BAR_HEIGHT = 64;

export default function ChatWindow({
  conversationId,
}: {
  conversationId: number;
}) {
  const currentUser = useAppSelector((state) => state.currentUser);
  const selectedConversation = useAppSelector((state) => state.conversation);

  const router = useRouter();
  const { t, locale, ready } = useTranslation();
  const { socket } = useSocketContext();

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

  const { startCall } = useVideoCallContext();

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

      setMessages((prev) => (cursor ? [...newMessages, ...prev] : newMessages));

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

  // Scroll xuống sau lần fetch đầu
  useEffect(() => {
    if (!messages.length) return;
    if (didInitialScroll.current) return;

    const el = containerRef.current;
    if (!el) return;

    el.scrollTop = el.scrollHeight;
    didInitialScroll.current = true;
  }, [messages]);

  // Scroll khi nhận tin nhắn mới từ người khác
  useEffect(() => {
    if (!incomingMessageRef.current) return;
    incomingMessageRef.current = false;

    const el = containerRef.current;
    if (!el) return;

    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const threshold = el.clientHeight * 0.5;

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
      return selectedConversation?.title || "N/A";
    }

    return otherUser?.fullName;
  }, [selectedConversation?.isGroup, selectedConversation?.title, otherUser]);

  // ── Socket: nhận tin nhắn mới (gồm cả call message) ──
  useEffect(() => {
    socket.emit("conversation:join", conversationId);

    const handleNewMessage = (message: Message) => {
      if (message.conversationId !== conversationId) return;
      if (
        isMe(message.senderId, currentUser.id) &&
        message.type !== MessageType.CALL
      )
        return;

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

  if (!ready) return null;

  return (
    <>
      <div className="md:hidden">
        <div
          className="fixed left-0 right-0 z-10 flex items-center justify-between px-3 border-b bg-background"
          style={{ top: NAVBAR_HEIGHT, height: CHAT_HEADER_HEIGHT }}
        >
          <div className="flex items-center gap-2">
            <Link href={`/${locale}/messages`}>
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <span className="font-medium">{conversationName}</span>
          </div>
          <div className="flex items-center gap-3">
            {!selectedConversation.isGroup && otherUser && (
              <button
                onClick={() => startCall(otherUser.id, selectedConversation.id)}
                className="p-1.5 rounded-full hover:bg-gray-100 transition-colors text-blue-500 cursor-pointer"
              >
                <Video className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="fixed left-0 right-0 overflow-y-auto p-4 space-y-4"
          style={{
            top: NAVBAR_HEIGHT + CHAT_HEADER_HEIGHT,
            bottom: INPUT_BAR_HEIGHT,
            overscrollBehavior: "contain",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {messages.map((m) => {
            const isMine = isMe(m.senderId, currentUser.id);

            const renderMessageContent = () => {
              switch (m.type) {
                case MessageType.CALL:
                  return <CallMessageBubble message={m} />;

                case MessageType.TEXT:
                  return (
                    <div
                      className={`px-3 py-2 rounded-2xl max-w-[70%] text-sm ${
                        isMine
                          ? "bg-blue-500 text-white"
                          : "bg-white text-black border"
                      }`}
                    >
                      {m.content}
                    </div>
                  );

                case MessageType.IMAGE:
                  return <></>;

                case MessageType.FILE:
                  return <></>;

                default:
                  return null;
              }
            };

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

                  {renderMessageContent()}
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
            className="fixed left-1/2 -translate-x-1/2 z-20 bg-blue-500 text-white px-4 py-1 rounded-full text-xs shadow"
            style={{ bottom: INPUT_BAR_HEIGHT + 12 }}
          >
            {t("chat.window.newMessages")}
          </button>
        )}

        <div
          className="fixed left-0 right-0 z-10 px-3 border-t bg-background flex items-center gap-2"
          style={{ bottom: 0, height: INPUT_BAR_HEIGHT }}
        >
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

      <div className="hidden md:flex flex-col h-full min-h-0 relative overflow-hidden">
        <div className="flex items-center justify-between p-3 border-b shrink-0">
          <span className="font-medium">{conversationName}</span>
          {!selectedConversation.isGroup && otherUser && (
            <button
              onClick={() => startCall(otherUser.id, selectedConversation.id)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors text-blue-500 cursor-pointer"
            >
              <Video className="w-5 h-5" />
            </button>
          )}
        </div>

        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0"
        >
          {messages.map((m) => {
            const isMine = isMe(m.senderId, currentUser.id);
            const renderMessageContent = () => {
              switch (m.type) {
                case MessageType.CALL:
                  return <CallMessageBubble message={m} />;
                case MessageType.TEXT:
                  return (
                    <div
                      className={`px-3 py-2 rounded-2xl max-w-[70%] text-sm ${
                        isMine
                          ? "bg-blue-500 text-white"
                          : "bg-white text-black border"
                      }`}
                    >
                      {m.content}
                    </div>
                  );
                case MessageType.IMAGE:
                  return <></>;
                case MessageType.FILE:
                  return <></>;
                default:
                  return null;
              }
            };
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
                  {renderMessageContent()}
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
    </>
  );
}

function CallMessageBubble({ message }: { message: Message }) {
  const { t } = useTranslation();

  let Icon = PhoneOff;
  let label = "";
  let colorClass = "text-gray-600 bg-gray-100 border-gray-200";

  switch (message.callStatus) {
    case CallEndReason.ENDED: {
      Icon = Video;
      colorClass = "text-green-600 bg-green-50 border-green-200";

      if (message.callDuration && message.callDuration > 0) {
        label = `${t("chat.call.ended.ended")} • ${formatDuration(
          message.callDuration,
        )}`;
      } else {
        label = t("chat.call.ended.ended");
      }

      break;
    }

    case CallEndReason.REJECTED: {
      Icon = PhoneOff;
      colorClass = "text-red-600 bg-red-50 border-red-200";
      label = t("chat.call.ended.rejected");
      break;
    }

    case CallEndReason.TIMEOUT: {
      Icon = PhoneOff;
      colorClass = "text-red-600 bg-red-50 border-red-200";
      label = t("chat.call.ended.missed");
      break;
    }

    default: {
      Icon = PhoneOff;
      colorClass = "text-red-600 bg-red-50 border-red-200";
      label = t("chat.call.ended.missed");
    }
  }

  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 text-sm rounded-2xl border max-w-[240px] ${colorClass}`}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </div>
  );
}
