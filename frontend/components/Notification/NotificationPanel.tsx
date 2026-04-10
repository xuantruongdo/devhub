"use client";

import { toastError } from "@/lib/toast";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setNotifications } from "@/redux/reducers/notifications";
import notificationService from "@/services/notification";
import { useEffect, useRef, useState } from "react";
import NotificationItem from "./NotificationItem";
import { useTranslation } from "@/hooks/useTranslation";
import { X } from "lucide-react";
import { Notification } from "@/types/notification";
import { LIMIT } from "@/constants";

export function NotificationPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation();

  const dispatch = useAppDispatch();
  const notifications = useAppSelector((state) => state.notifications);

  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const containerRef = useRef<HTMLDivElement | null>(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);

        const { data } = await notificationService.findAll<Notification[]>({
          limit: LIMIT,
        });

        dispatch(setNotifications(data));
        setHasMore(data.length === LIMIT);
      } catch (error: any) {
        toastError(error);
      } finally {
        setLoading(false);
      }
    };

    if (open) fetchNotifications();
  }, [dispatch, open]);

  const loadMore = async () => {
    if (loading || !hasMore) return;

    try {
      setLoading(true);

      const lastId = notifications[notifications.length - 1]?.id;

      const { data } = await notificationService.findAll<Notification[]>({
        limit: LIMIT,
        cursor: lastId,
      });

      if (data.length === 0) {
        setHasMore(false);
        return;
      }

      dispatch(setNotifications([...notifications, ...data]));
    } catch (e) {
      toastError(e);
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;

    const isNearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 50;

    if (isNearBottom) {
      loadMore();
    }
  };

  const markAllRead = async () => {
    try {
      await notificationService.markAllRead();

      dispatch(
        setNotifications(
          notifications.map((n) => ({
            ...n,
            isRead: true,
          })),
        ),
      );
    } catch (e) {
      toastError(e);
    }
  };

  const markRead = async (id: number) => {
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

  if (!open) return null;

  return (
    <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm">
            {t("header.notification.title")}
          </h3>
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
            onClick={() => markRead(n.id)}
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
        <button className="text-xs text-primary hover:underline w-full text-center">
          {t("header.notification.viewAll")}
        </button>
      </div>
    </div>
  );
}
