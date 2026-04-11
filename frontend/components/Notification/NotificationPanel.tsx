"use client";

import { useRef } from "react";
import NotificationItem from "./NotificationItem";
import { useTranslation } from "@/hooks/useTranslation";
import { X } from "lucide-react";
import { Notification } from "@/types/notification";
import Link from "next/link";

export function NotificationPanel({
  open,
  onClose,
  notifications,
  unreadCount,
  loading,
  hasMore,
  onLoadMore,
  onMarkAllRead,
  onMarkRead,
}: {
  open: boolean;
  onClose: () => void;
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onMarkAllRead: () => void;
  onMarkRead: (id: number) => void;
}) {
  const { t, locale } = useTranslation();
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;

    const isNearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 50;

    if (isNearBottom) {
      onLoadMore();
    }
  };

  if (!open) return null;

  return (
    <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm">
            {t("header.notification.title")}
          </h3>
          {unreadCount > 0 && (
            <span className="text-xs bg-primary text-primary-foreground rounded-full px-2.5 py-1">
              {unreadCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllRead}
              className="text-xs text-primary hover:underline"
            >
              {t("header.notification.markAll")}
            </button>
          )}
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="max-h-[400px] overflow-y-auto"
      >
        {notifications.map((n) => (
          <NotificationItem
            key={n.id}
            notification={n}
            onClick={() => onMarkRead(n.id)}
          />
        ))}

        {loading && (
          <div className="text-center text-xs py-2 text-muted-foreground">
            {t("header.notification.loading")}
          </div>
        )}

        {!hasMore && (
          <div className="text-center text-xs py-2 text-muted-foreground">
            {t("header.notification.noMore")}
          </div>
        )}
      </div>

      <div className="px-4 py-2 border-t border-border">
        <Link
          href={`/${locale}/notifications`}
          onClick={onClose}
          className="flex w-full justify-center text-xs text-primary hover:underline"
        >
          {t("header.notification.viewAll")}
        </Link>
      </div>
    </div>
  );
}
