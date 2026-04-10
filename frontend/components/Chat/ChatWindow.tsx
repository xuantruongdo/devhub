"use client";

import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import chatService from "@/services/chat";
import { useAppSelector } from "@/redux/hooks";
import { Message } from "@/types/chat";
import { MESSAGE_LIMIT } from "@/constants";

export default function ChatWindow({
  conversationId,
}: {
  conversationId: number;
}) {
  const currentUser = useAppSelector((state) => state.currentUser);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const isInitialLoad = useRef(true);

  // reset when change conversation
  useEffect(() => {
    setMessages([]);
    setHasMore(true);
    isInitialLoad.current = true;
    fetchMessages();
  }, [conversationId]);

  const fetchMessages = async (cursor?: number) => {
    if (loading) return;

    setLoading(true);

    const el = containerRef.current;
    const prevScrollHeight = el?.scrollHeight || 0;

    try {
      const res = await chatService.getMessages(conversationId, {
        limit: MESSAGE_LIMIT,
        cursor,
      });

      const newMessages = res.data;

      if (newMessages.length < MESSAGE_LIMIT) {
        setHasMore(false);
      }

      setMessages((prev) => {
        const map = new Map<number, Message>();

        [...newMessages, ...prev].forEach((m) => {
          map.set(m.id, m);
        });

        return Array.from(map.values()).sort(
          (a, b) => +new Date(a.createdAt) - +new Date(b.createdAt),
        );
      });

      // requestAnimationFrame(() => {
      //   if (!el) return;

      //   // ✅ FIRST LOAD → scroll bottom
      //   if (isInitialLoad.current) {
      //     el.scrollTop = el.scrollHeight;
      //     isInitialLoad.current = false;
      //     return;
      //   }

      //   // ✅ LOAD MORE → giữ vị trí scroll
      //   const newScrollHeight = el.scrollHeight;
      //   el.scrollTop = newScrollHeight - prevScrollHeight;
      // });
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el || loading || !hasMore) return;

    // gần top → load message cũ
    if (el.scrollTop < 100) {
      const oldest = messages[0];
      if (oldest) {
        fetchMessages(oldest.id);
      }
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const tempId = Date.now();

    const temp: any = {
      id: tempId,
      conversationId,
      senderId: currentUser.id,
      content: input,
      createdAt: new Date() as any,
    };

    // optimistic update
    setMessages((prev) => [...prev, temp]);
    setInput("");

    // auto scroll bottom khi gửi
    // requestAnimationFrame(() => {
    //   containerRef.current?.scrollTo({
    //     top: containerRef.current.scrollHeight,
    //     behavior: "smooth",
    //   });
    // });

    try {
      const res = await chatService.sendMessage({
        conversationId,
        content: temp.content,
      });

      const saved = res.data;

      setMessages((prev) => prev.map((m) => (m.id === tempId ? saved : m)));
    } catch (err) {
      // rollback nếu lỗi
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* messages */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-2"
      >
        {messages.map((m) => {
          const isMine = m.senderId === currentUser.id;

          return (
            <div
              key={m.id}
              className={`flex ${isMine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`px-3 py-2 rounded-2xl max-w-[70%] text-sm ${
                  isMine ? "bg-blue-500 text-white" : "bg-white border"
                }`}
              >
                {m.content}

                {!isMine && m.sender && (
                  <div className="text-[10px] text-gray-500 mt-1">
                    {m.sender.fullName}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="text-xs text-gray-400 text-center">Loading...</div>
        )}
      </div>

      {/* input */}
      <div className="p-3 border-t flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 border px-3 py-2 rounded-full"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
        />

        <button
          onClick={handleSend}
          className="p-2 bg-blue-500 text-white rounded-full"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
