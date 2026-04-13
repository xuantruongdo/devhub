"use client";

import { useEffect, useState, useCallback } from "react";
import { CustomDialog } from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User } from "@/types/user";
import userService from "@/services/user";
import { useTranslation } from "@/hooks/useTranslation";
import { toastError } from "@/lib/toast";
import { useAppSelector } from "@/redux/hooks";
import { Loader2 } from "lucide-react";
import { FollowType } from "@/constants";
import Link from "next/link";

interface UserFollowDialogProps {
  user: User;
  open: boolean;
  defaultTab?: FollowType;
  onClose: () => void;
}

function FollowUserItem({
  item,
  isMe,
  onToggleFollow,
  following,
}: {
  item: User;
  isMe: boolean;
  onToggleFollow: (user: User) => void;
  following: boolean;
}) {
  const { t, locale } = useTranslation();

  return (
    <div className="flex items-center justify-between gap-3 px-2 py-2.5 hover:bg-muted/40 transition-colors rounded-lg">
      <Link 
      href={`/${locale}/${item.username}`}
        className="flex items-center gap-3 flex-1 min-w-0 text-left"
      >
        <Avatar className="w-10 h-10">
          <AvatarImage
            src={item.avatar || "/placeholder.svg"}
            alt={item.fullName}
          />
          <AvatarFallback>{item.fullName?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="font-semibold text-sm text-foreground truncate leading-tight">
            {item.fullName}
          </p>
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            @{item.username}
          </p>
        </div>
      </Link>

      {!isMe && (
        <Button
          size="sm"
          variant={following ? "outline" : "default"}
          className="flex-shrink-0 text-xs h-8 px-4 rounded-full"
          onClick={() => onToggleFollow(item)}
        >
          {following ? t("profile.followingLabel") : t("profile.follow")}
        </Button>
      )}
    </div>
  );
}

function FollowList({
  userId,
  type,
  currentUserId,
}: {
  userId: number;
  type: FollowType;
  currentUserId?: number;
}) {
  const [followUsers, setFollowUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [followingMap, setFollowingMap] = useState<Record<number, boolean>>({});
  const { t } = useTranslation();

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await userService.getListFollow(userId, type);

      const users: User[] = data.users ?? data ?? [];
      setFollowUsers(users);

      const map: Record<number, boolean> = {};
      users.forEach((u) => {
        map[u.id] = u.isFollowing ?? false;
      });
      setFollowingMap(map);
    } catch (error: any) {
      toastError(error);
    } finally {
      setLoading(false);
    }
  }, [userId, type]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const handleToggleFollow = async (target: User) => {
    setFollowingMap((prev) => ({ ...prev, [target.id]: !prev[target.id] }));
    try {
      const { data } = await userService.toggleFollow(target.id);
      setFollowingMap((prev) => ({ ...prev, [target.id]: data.following }));
    } catch (error: any) {
      setFollowingMap((prev) => ({ ...prev, [target.id]: !prev[target.id] }));
      toastError(error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-14">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (followUsers.length === 0) {
    return (
      <div className="flex items-center justify-center py-14">
        <p className="text-sm text-muted-foreground">
          {type === FollowType.FOLLOWER
            ? t("profile.noFollowers")
            : t("profile.noFollowing")}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0.5">
      {followUsers.map((u) => (
        <FollowUserItem
          key={u.id}
          item={u}
          isMe={u.id === currentUserId}
          following={followingMap[u.id] ?? false}
          onToggleFollow={handleToggleFollow}
        />
      ))}
    </div>
  );
}

export default function UserFollowDialog({
  user,
  open,
  defaultTab = FollowType.FOLLOWER,
  onClose,
}: UserFollowDialogProps) {
  const { t } = useTranslation();
  const currentUser = useAppSelector((state) => state.currentUser);
  const [activeTab, setActiveTab] = useState<FollowType>(defaultTab);

  useEffect(() => {
    if (open) setActiveTab(defaultTab);
  }, [open, defaultTab]);

  return (
    <CustomDialog
      title={user.fullName}
      open={open}
      onCancel={onClose}
      onConfirm={() => {}}
      hideConfirmButton
      cancelText={t("profile.cancel")}
      className="sm:max-w-md"
      contentClassName="overflow-x-hidden"
    >
      <div className="flex border-b border-border -mx-6 px-6">
        <button
          onClick={() => setActiveTab(FollowType.FOLLOWER)}
          className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
            activeTab === FollowType.FOLLOWER
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          {t("profile.followers")}
        </button>
        <button
          onClick={() => setActiveTab(FollowType.FOLLOWING)}
          className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
            activeTab === FollowType.FOLLOWING
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          {t("profile.following")}
        </button>
      </div>

      <div className="max-h-[420px] overflow-y-auto mt-1 -mx-2">
        {activeTab === FollowType.FOLLOWER && (
          <FollowList
            userId={user.id}
            type={FollowType.FOLLOWER}
            currentUserId={currentUser?.id}
          />
        )}
        {activeTab === FollowType.FOLLOWING && (
          <FollowList
            userId={user.id}
            type={FollowType.FOLLOWING}
            currentUserId={currentUser?.id}
          />
        )}
      </div>
    </CustomDialog>
  );
}
