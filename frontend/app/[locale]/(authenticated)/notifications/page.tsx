"use client";

import { toastError } from "@/lib/toast";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setNotifications } from "@/redux/reducers/notifications";
import notificationService from "@/services/notification";
import { useEffect, useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { Notification } from "@/types/notification";
import { LIMIT } from "@/constants";
import NotificationItem from "@/components/Notification/NotificationItem";

export default function NotificationPage() {
  const { t } = useTranslation();

  const dispatch = useAppDispatch();
  const notifications = useAppSelector((state) => state.notifications);

  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

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

    fetchNotifications();
  }, [dispatch]);

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

      if (data.length < LIMIT) {
        setHasMore(false);
      }
    } catch (e) {
      toastError(e);
    } finally {
      setLoading(false);
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

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="sticky top-0 z-10 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-base">
            {t("header.notification.title")}
          </h2>

          {unreadCount > 0 && (
            <span className="text-xs bg-primary text-primary-foreground rounded-full px-1.5 py-0.5">
              {unreadCount}
            </span>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-xs text-primary hover:underline"
          >
            {t("header.notification.markAll")}
          </button>
        )}
      </div>

      <div className="divide-y">
        {notifications.map((n) => (
          <NotificationItem
            key={n.id}
            notification={n}
            onClick={() => markRead(n.id)}
          />
        ))}
      </div>

      <div className="py-4 text-center">
        {loading && (
          <p className="text-xs text-muted-foreground">
            {t("header.notification.loading")}
          </p>
        )}

        {!loading && hasMore && (
          <button
            onClick={loadMore}
            className="text-sm text-primary hover:underline"
          >
            {t("header.notification.viewMore")}
          </button>
        )}

        {!hasMore && (
          <p className="text-xs text-muted-foreground">
            {t("header.notification.noMore")}
          </p>
        )}
      </div>
    </div>
  );
}
