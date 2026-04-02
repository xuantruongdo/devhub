"use client";

import {
  Bell,
  LogOut,
  MessageCircle,
  Search,
  Settings,
  X,
  CheckCheck,
} from "lucide-react";
import { ModeToggle } from "../ModeToggle";
import { LanguageToggle } from "../LanguageToggle";
import { useAppSelector } from "@/redux/hooks";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu";
import { toastError } from "@/lib/toast";
import authService from "@/services/auth";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Input } from "../ui/input";
import { useState, useRef, useEffect } from "react";
import { CurrentUserResponse } from "@/types/auth";

const FAKE_USERS = [
  {
    id: 1,
    fullName: "Nguyễn Văn An",
    username: "nguyenvanan",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=An",
    role: "Frontend Developer",
  },
  {
    id: 2,
    fullName: "Trần Thị Bích",
    username: "tranthibich",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bich",
    role: "Backend Developer",
  },
  {
    id: 3,
    fullName: "Lê Minh Cường",
    username: "leminhcuong",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Cuong",
    role: "DevOps Engineer",
  },
  {
    id: 4,
    fullName: "Phạm Hồng Dung",
    username: "phamhongdung",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dung",
    role: "UI/UX Designer",
  },
  {
    id: 5,
    fullName: "Hoàng Đức Em",
    username: "hoangducem",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Em",
    role: "Full Stack Developer",
  },
];

const FAKE_POSTS = [
  {
    id: 1,
    title: "Cách tối ưu React re-renders với useMemo",
    tags: ["react", "performance"],
  },
  {
    id: 2,
    title: "Docker Compose cho môi trường development",
    tags: ["docker", "devops"],
  },
  {
    id: 3,
    title: "Giới thiệu Next.js 15 App Router",
    tags: ["nextjs", "frontend"],
  },
];

const FAKE_NOTIFICATIONS = [
  {
    id: 1,
    type: "like",
    read: false,
    time: "2 phút trước",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=An",
    message: "Nguyễn Văn An đã thích bài viết của bạn",
    sub: "Cách tối ưu React re-renders...",
  },
  {
    id: 2,
    type: "comment",
    read: false,
    time: "15 phút trước",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bich",
    message: "Trần Thị Bích đã bình luận về bài viết của bạn",
    sub: '"Bài viết rất hay, cảm ơn bạn!"',
  },
  {
    id: 3,
    type: "follow",
    read: false,
    time: "1 giờ trước",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Cuong",
    message: "Lê Minh Cường đã bắt đầu theo dõi bạn",
    sub: "",
  },
  {
    id: 4,
    type: "mention",
    read: true,
    time: "3 giờ trước",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dung",
    message: "Phạm Hồng Dung đã đề cập đến bạn trong bình luận",
    sub: '"@you xem thử cách này nhé!"',
  },
  {
    id: 5,
    type: "like",
    read: true,
    time: "Hôm qua",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Em",
    message: "Hoàng Đức Em và 12 người khác đã thích bài viết",
    sub: "Docker Compose cho môi trường...",
  },
];

const FAKE_MESSAGES = [
  {
    id: 1,
    user: {
      fullName: "Nguyễn Văn An",
      username: "nguyenvanan",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=An",
    },
    lastMessage: "Bạn có thể review PR của mình không?",
    time: "2p",
    unread: 3,
    online: true,
  },
  {
    id: 2,
    user: {
      fullName: "Trần Thị Bích",
      username: "tranthibich",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bich",
    },
    lastMessage: "Cảm ơn bạn đã giúp mình hôm qua!",
    time: "45p",
    unread: 0,
    online: true,
  },
  {
    id: 3,
    user: {
      fullName: "Lê Minh Cường",
      username: "leminhcuong",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Cuong",
    },
    lastMessage: "Deploy xong rồi bạn ơi 🎉",
    time: "2h",
    unread: 1,
    online: false,
  },
  {
    id: 4,
    user: {
      fullName: "Phạm Hồng Dung",
      username: "phamhongdung",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dung",
    },
    lastMessage: "Mình gửi design mới qua nhé",
    time: "1n",
    unread: 0,
    online: false,
  },
];

function SearchDropdown({ query }: { query: string }) {
  const filteredUsers = FAKE_USERS.filter(
    (u) =>
      u.fullName.toLowerCase().includes(query.toLowerCase()) ||
      u.username.toLowerCase().includes(query.toLowerCase()),
  );
  const filteredPosts = FAKE_POSTS.filter((p) =>
    p.title.toLowerCase().includes(query.toLowerCase()),
  );

  if (!query) return null;
  if (filteredUsers.length === 0 && filteredPosts.length === 0) {
    return (
      <div className="fixed sm:absolute top-full mt-2 left-0 w-full bg-card border border-border rounded-xl shadow-xl z-50 p-4 text-sm text-muted-foreground text-center">
        Không tìm thấy kết quả cho
      </div>
    );
  }

  return (
    <div className="fixed sm:absolute top-full mt-2 left-0 w-full min-w-[320px] bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
      {filteredUsers.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground px-3 pt-3 pb-1 uppercase tracking-wider">
            Người dùng
          </p>
          {filteredUsers.map((u) => (
            <button
              key={u.id}
              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-muted transition-colors text-left"
            >
              <img
                src={u.avatar}
                alt={u.fullName}
                className="w-8 h-8 rounded-full bg-muted"
              />
              <div>
                <p className="text-sm font-medium">{u.fullName}</p>
                <p className="text-xs text-muted-foreground">
                  @{u.username} · {u.role}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
      {filteredPosts.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground px-3 pt-3 pb-1 uppercase tracking-wider">
            Bài viết
          </p>
          {filteredPosts.map((p) => (
            <button
              key={p.id}
              className="w-full flex items-start gap-3 px-3 py-2 hover:bg-muted transition-colors text-left"
            >
              <div className="mt-0.5 w-5 h-5 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Search className="w-3 h-3 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium leading-snug">{p.title}</p>
                <div className="flex gap-1 mt-0.5 flex-wrap">
                  {p.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
      <div className="border-t border-border px-3 py-2">
        <button className="text-xs text-primary hover:underline">
          Xem tất cả kết quả cho →
        </button>
      </div>
    </div>
  );
}

function NotificationPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [notifications, setNotifications] = useState(FAKE_NOTIFICATIONS);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () =>
    setNotifications((n) => n.map((x) => ({ ...x, read: true })));
  const markRead = (id: number) =>
    setNotifications((n) =>
      n.map((x) => (x.id === id ? { ...x, read: true } : x)),
    );

  if (!open) return null;

  return (
    <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm">Thông báo</h3>
          {unreadCount > 0 && (
            <span className="text-xs bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 font-medium">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              <CheckCheck className="w-3 h-3" />
              Đọc tất cả
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded-full ml-2"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        {notifications.map((n) => (
          <button
            key={n.id}
            onClick={() => markRead(n.id)}
            className={`w-full flex items-start gap-3 px-4 py-3 hover:bg-muted/60 transition-colors text-left border-b border-border/50 last:border-0 ${
              !n.read ? "bg-primary/5" : ""
            }`}
          >
            <div className="relative flex-shrink-0">
              <img
                src={n.avatar}
                alt=""
                className="w-10 h-10 rounded-full bg-muted"
              />
              {!n.read && (
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-primary rounded-full border-2 border-card" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className={`text-sm leading-snug ${!n.read ? "font-medium" : "text-muted-foreground"}`}
              >
                {n.message}
              </p>
              {n.sub && (
                <p className="text-xs text-muted-foreground mt-0.5 truncate italic">
                  {n.sub}
                </p>
              )}
              <p className="text-xs text-primary mt-1">{n.time}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="px-4 py-2 border-t border-border">
        <button className="text-xs text-primary hover:underline w-full text-center">
          Xem tất cả thông báo →
        </button>
      </div>
    </div>
  );
}

function MessagesPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const totalUnread = FAKE_MESSAGES.reduce((sum, m) => sum + m.unread, 0);

  if (!open) return null;

  return (
    <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm">Tin nhắn</h3>
          {totalUnread > 0 && (
            <span className="text-xs bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 font-medium">
              {totalUnread}
            </span>
          )}
        </div>
        <button onClick={onClose} className="p-1 hover:bg-muted rounded-full">
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        {FAKE_MESSAGES.map((m) => (
          <button
            key={m.id}
            className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/60 transition-colors text-left border-b border-border/50 last:border-0 ${
              m.unread > 0 ? "bg-primary/5" : ""
            }`}
          >
            <div className="relative flex-shrink-0">
              <img
                src={m.user.avatar}
                alt={m.user.fullName}
                className="w-11 h-11 rounded-full bg-muted"
              />
              {m.online && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p
                  className={`text-sm ${m.unread > 0 ? "font-semibold" : "font-medium"}`}
                >
                  {m.user.fullName}
                </p>
                <span className="text-xs text-muted-foreground flex-shrink-0">
                  {m.time}
                </span>
              </div>
              <div className="flex items-center justify-between mt-0.5">
                <p
                  className={`text-xs truncate ${m.unread > 0 ? "text-foreground font-medium" : "text-muted-foreground"}`}
                >
                  {m.lastMessage}
                </p>
                {m.unread > 0 && (
                  <span className="ml-2 flex-shrink-0 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center font-bold">
                    {m.unread}
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="px-4 py-2 border-t border-border">
        <button className="text-xs text-primary hover:underline w-full text-center">
          Mở hộp thư đầy đủ →
        </button>
      </div>
    </div>
  );
}

function UserDropdown({
  user,
  onLogout,
  t,
}: {
  user: CurrentUserResponse;
  onLogout: () => void;
  t: (key: string) => string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar size="lg" className="cursor-pointer">
          {user.avatar ? (
            <AvatarImage src={user.avatar} alt={user.fullName} />
          ) : (
            <AvatarFallback>
              {user.fullName.charAt(0).toUpperCase()}
            </AvatarFallback>
          )}
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <div className="px-3 py-2 border-b">
          <p className="text-sm font-semibold">{user.fullName}</p>
          <p className="text-xs text-muted-foreground">@{user.username}</p>
        </div>

        <div className="sm:hidden">
          <DropdownMenuItem>
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </DropdownMenuItem>

          <DropdownMenuItem>
            <MessageCircle className="mr-2 h-4 w-4" />
            Messages
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem>
            <LanguageToggle />
            <span className="ml-2">Language</span>
          </DropdownMenuItem>

          <DropdownMenuItem>
            <ModeToggle />
            <span className="ml-2">Theme</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />
        </div>

        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          {t("header.settings")}
        </DropdownMenuItem>

        <DropdownMenuItem
          className="text-red-500 focus:text-red-500"
          onClick={onLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          {t("header.logout")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function Header() {
  const user = useAppSelector((state) => state.currentUser);
  const router = useRouter();
  const { t, locale, ready } = useTranslation();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [msgOpen, setMsgOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const msgRef = useRef<HTMLDivElement>(null);

  const unreadNotifs = FAKE_NOTIFICATIONS.filter((n) => !n.read).length;
  const unreadMsgs = FAKE_MESSAGES.reduce((sum, m) => sum + m.unread, 0);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (msgRef.current && !msgRef.current.contains(e.target as Node)) {
        setMsgOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const onLogout = async () => {
    try {
      await authService.logout();
      router.push(`/${locale}/login`);
      localStorage.removeItem("accessToken");
    } catch (error) {
      toastError(error);
    }
  };

  if (!ready) return null;

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-3 sm:px-6 gap-2">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">
          DevHub
        </h1>

        <div className="flex-1 max-w-[200px] sm:max-w-md" ref={searchRef}>
          <div className="relative w-full">
            <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 sm:h-5 sm:w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t("header.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              className="w-full pl-8 sm:pl-10 pr-2 py-1.5 sm:py-5 rounded-full bg-muted text-foreground placeholder-muted-foreground text-sm sm:text-base focus:ring-2 focus:ring-primary"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSearchOpen(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            {searchOpen && searchQuery && (
              <SearchDropdown query={searchQuery} />
            )}
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-3">
          <div className="relative" ref={notifRef}>
            <button
              className="p-2 hover:bg-secondary rounded-full relative"
              onClick={() => {
                setNotifOpen((o) => !o);
                setMsgOpen(false);
              }}
            >
              <Bell className="h-5 w-5" />
              {unreadNotifs > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>
            <NotificationPanel
              open={notifOpen}
              onClose={() => setNotifOpen(false)}
            />
          </div>

          <div className="relative" ref={msgRef}>
            <button
              className="p-2 hover:bg-secondary rounded-full relative"
              onClick={() => {
                setMsgOpen((o) => !o);
                setNotifOpen(false);
              }}
            >
              <MessageCircle className="h-5 w-5" />
              {unreadMsgs > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center px-0.5">
                  {unreadMsgs}
                </span>
              )}
            </button>
            <MessagesPanel open={msgOpen} onClose={() => setMsgOpen(false)} />
          </div>

          <LanguageToggle />
          <ModeToggle />

          <UserDropdown user={user} onLogout={onLogout} t={t} />
        </div>

        <div className="sm:hidden">
          <UserDropdown user={user} onLogout={onLogout} t={t} />
        </div>
      </div>
    </header>
  );
}
