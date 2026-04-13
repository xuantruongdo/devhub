import { Heart, MessageCircle, UserPlus } from "lucide-react";
import moment from "moment";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Notification } from "@/types/notification";
import { useTranslation } from "@/hooks/useTranslation";
import { NotificationType } from "@/constants";
import Link from "next/link";

interface NotificationItemProps {
  notification: Notification;
  onClick: () => void;
}

export default function NotificationItem({
  notification: n,
  onClick,
}: NotificationItemProps) {
  const { t, locale } = useTranslation();

  const name = n.sender.fullName;

  const getContent = () => {
    switch (n.type) {
      case NotificationType.LIKE_POST:
        return {
          href: `/${locale}/posts/${n.postId}`,
          icon: <Heart className="w-4 h-4 text-red-500" />,
          message: `${name} ` + t("header.notification.likePost"),
        };

      case NotificationType.COMMENT:
        return {
          href: `/${locale}/posts/${n.postId}?commentId=${n.commentId}`,
          icon: <MessageCircle className="w-4 h-4 text-blue-500" />,
          message: `${name} ` + t("header.notification.comment"),
        };

      case NotificationType.LIKE_COMMENT:
        return {
          href: `/${locale}/posts/${n.postId}?commentId=${n.commentId}`,
          icon: <Heart className="w-4 h-4 text-pink-500" />,
          message: `${name} ` + t("header.notification.likeComment"),
        };

      case NotificationType.FOLLOW:
        return {
          href: `/${locale}/${n.sender.username}`,
          icon: <UserPlus className="w-4 h-4 text-green-500" />,
          message: `${name} ` + t("header.notification.follow"),
        };

      default:
        return {
          href: "",
          icon: null,
          message: t("header.notification.new"),
        };
    }
  };

  const { icon, message, href } = getContent();

  return (
    <Link
      href={href}
      onClick={() => {
        if (n.isRead) return;
        onClick();
      }}
      className={`w-full flex items-start gap-3 px-4 py-3 hover:bg-muted/60 transition-colors text-left border-b border-border/50 last:border-0 ${
        !n.isRead ? "bg-primary/5" : ""
      }`}
    >
      <div className="relative flex-shrink-0">
        <Avatar size="lg">
          {n.sender?.avatar ? (
            <AvatarImage src={n.sender.avatar} />
          ) : (
            <AvatarFallback>
              {n.sender.fullName?.charAt(0) || "U"}
            </AvatarFallback>
          )}
        </Avatar>

        {icon && (
          <span className="absolute -bottom-1 -right-1 bg-card rounded-full p-1 shadow">
            {icon}
          </span>
        )}

        {!n.isRead && (
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-primary rounded-full border-2 border-card" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p
          className={`text-sm leading-snug ${
            !n.isRead ? "font-medium" : "text-muted-foreground"
          }`}
        >
          {message}
        </p>

        <p className="text-xs text-primary mt-1">
          {moment(n.createdAt).fromNow()}
        </p>
      </div>
    </Link>
  );
}
