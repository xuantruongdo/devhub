"use client";

import { Bell, MessageCircle, Search, X } from "lucide-react";
import { ModeToggle } from "../ModeToggle";
import { LanguageToggle } from "../LanguageToggle";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { toastError } from "@/lib/toast";
import authService from "@/services/auth";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";
import { Input } from "../ui/input";
import { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { NotificationPanel } from "../Notification/NotificationPanel";
import notificationService from "@/services/notification";
import { LIMIT, MessageType } from "@/constants";
import { setNotifications } from "@/redux/reducers/notifications";
import { Notification as NotificationProps } from "@/types/notification";
import { Conversation } from "@/types/chat";
import chatService from "@/services/chat";
import { MessagesPanel } from "../Message/MessagesPanel";
import { getUnread, isMe } from "@/lib/utils";
import { useSocketContext } from "@/contexts/SocketContext";
import { useModal } from "@/hooks/useModal";
import { SearchDropdown } from "./SearchDropdown";
import { UserDropdown } from "./UserDropdown";

export default function Header() {
  const currentUser = useAppSelector((state) => state.currentUser);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { t, locale } = useTranslation();
  const { socket } = useSocketContext();

  // Notification
  const notifications = useAppSelector((state) => state.notifications);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifHasMore, setNotifHasMore] = useState(true);

  // Message
  const [msgLoading, setMsgLoading] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);

  // Search
  const [searchQuery, setSearchQuery] = useState("");

  const {
    isOpen: isOpenSearch,
    openModal: openModalSearch,
    closeModal: closeModalSearch,
  } = useModal();
  const {
    isOpen: isOpenMessage,
    openModal: openModalMessage,
    closeModal: closeModalMessage,
  } = useModal();
  const {
    isOpen: isOpenNoti,
    openModal: openModalNoti,
    closeModal: closeModalNoti,
  } = useModal();

  // Ref
  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const msgRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      setNotifLoading(true);

      const { data } = await notificationService.findAll<NotificationProps[]>({
        limit: LIMIT,
      });

      dispatch(setNotifications(data));
      setNotifHasMore(data.length === LIMIT);
    } catch (error) {
      toastError(error);
    } finally {
      setNotifLoading(false);
    }
  };

  const loadMoreNotifications = async () => {
    if (notifLoading || !notifHasMore) return;

    try {
      setNotifLoading(true);

      const lastId = notifications[notifications.length - 1]?.id;

      const { data } = await notificationService.findAll<NotificationProps[]>({
        limit: LIMIT,
        cursor: lastId,
      });

      if (data.length === 0) {
        setNotifHasMore(false);
        return;
      }

      dispatch(setNotifications([...notifications, ...data]));
    } catch (e) {
      toastError(e);
    } finally {
      setNotifLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead();

      dispatch(
        setNotifications(notifications.map((n) => ({ ...n, isRead: true }))),
      );
    } catch (e) {
      toastError(e);
    }
  };

  const handleMarkRead = async (id: number) => {
    try {
      await notificationService.markAsRead(id);

      dispatch(
        setNotifications(
          notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
        ),
      );
    } catch (e) {
      toastError(e);
    }
  };

  const fetchConversations = async () => {
    try {
      setMsgLoading(true);

      const { data } = await chatService.getMyConversations();

      setConversations(data.map((c) => c.conversation));
    } catch (e) {
      toastError(e);
    } finally {
      setMsgLoading(false);
    }
  };

  const handleOpenConversation = (conversation: Conversation) => {
    closeModalMessage();

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== conversation.id) return c;

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
  };

  const handleCloseSearch = () => {
    closeModalSearch();
    setSearchQuery("");
  };

  useEffect(() => {
    const init = async () => {
      await Promise.all([fetchNotifications(), fetchConversations()]);
    };

    init();
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        closeModalSearch();
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        closeModalNoti();
      }
      if (msgRef.current && !msgRef.current.contains(e.target as Node)) {
        closeModalMessage();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleNewNotification = (notif: NotificationProps) => {
      dispatch(setNotifications([notif, ...notifications]));
    };

    socket.on("notification:new", handleNewNotification);

    return () => {
      socket.off("notification:new", handleNewNotification);
    };
  }, [notifications, socket]);

  useEffect(() => {
    const handleConversationUpdate = (conv: Conversation) => {
      setConversations((prev) => {
        const filtered = prev.filter((c) => c.id !== conv.id);
        return [conv, ...filtered];
      });

      if (conv.lastMessage.type === MessageType.CALL) return;

      const title = `New message from ${conv.lastMessage.sender.fullName}`;
      const body = conv.isGroup
        ? `${conv.lastMessage.content} - ${conv.lastMessage.sender.fullName}`
        : conv.lastMessage.content;

      // PHẢI CÓ ĐOẠN CHECK, NẾU KHÔNG APP SẼ BỊ CRASH TRÊN MOBILE
      if (
        document.hidden ||
        (!document.hasFocus() && "Notification" in window)
      ) {
        if (Notification.permission === "granted") {
          new Notification(title, {
            body,
            icon: "/vercel.svg",
          });
        }
      }
    };

    socket.on("conversation:update", handleConversationUpdate);

    return () => {
      socket.off("conversation:update", handleConversationUpdate);
    };
  }, [socket]);

  const onLogout = async () => {
    try {
      await authService.logout();
      router.push(`/${locale}/login`);
      localStorage.removeItem("accessToken");
    } catch (error) {
      toastError(error);
    }
  };

  const unreadNotifs = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  const unreadMsgs = useMemo(() => {
    return getUnread(conversations, currentUser.id);
  }, [conversations]);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-3 sm:px-6 gap-2">
        <Link href={`/${locale}`}>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            DevHub
          </h1>
        </Link>

        <div className="flex-1 w-full sm:max-w-md" ref={searchRef}>
          <div className="relative w-full">
            <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 sm:h-5 sm:w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t("header.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                openModalSearch();
              }}
              onFocus={openModalSearch}
              className="w-full pl-8 sm:pl-10 pr-2 py-1.5 sm:py-5 rounded-full bg-muted text-foreground placeholder-muted-foreground text-sm sm:text-base focus:ring-2 focus:ring-primary"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  closeModalSearch();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            {isOpenSearch && searchQuery && (
              <SearchDropdown query={searchQuery} onClose={handleCloseSearch} />
            )}
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-3">
          <div className="relative" ref={notifRef}>
            <button
              className="p-2 hover:bg-secondary rounded-full relative"
              onClick={openModalNoti}
            >
              <Bell className="h-5 w-5" />
              {unreadNotifs > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>

            <NotificationPanel
              open={isOpenNoti}
              onClose={closeModalNoti}
              notifications={notifications}
              unreadCount={unreadNotifs}
              loading={notifLoading}
              hasMore={notifHasMore}
              onLoadMore={loadMoreNotifications}
              onMarkAllRead={handleMarkAllRead}
              onMarkRead={handleMarkRead}
            />
          </div>

          <div className="relative" ref={msgRef}>
            <button
              className="p-2 hover:bg-secondary rounded-full relative"
              onClick={openModalMessage}
            >
              <MessageCircle className="h-5 w-5" />

              {unreadMsgs > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>
            <MessagesPanel
              open={isOpenMessage}
              onClose={closeModalMessage}
              conversations={conversations}
              unreadCount={unreadMsgs}
              loading={msgLoading}
              onOpenConversation={handleOpenConversation}
            />
          </div>

          <LanguageToggle />
          <ModeToggle />

          <UserDropdown
            onLogout={onLogout}
            unreadNotifs={unreadNotifs}
            unreadMsgs={unreadMsgs}
          />
        </div>

        <div className="sm:hidden">
          <UserDropdown
            onLogout={onLogout}
            unreadNotifs={unreadNotifs}
            unreadMsgs={unreadMsgs}
          />
        </div>
      </div>
    </header>
  );
}
