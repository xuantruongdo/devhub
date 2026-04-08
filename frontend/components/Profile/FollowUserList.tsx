"use client";

import {
    CustomDialog,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { User } from "@/types/user";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { FC, useState } from "react";
import { Button } from "@/components/ui/button";
import userService from "@/services/user";
import { toastError } from "@/lib/toast";

interface FollowUserListProps {
  open: boolean;
  title: string;
  users: User[];
  currentUserId?: number;
  onClose: () => void;
}

const FollowUserList: FC<FollowUserListProps> = ({
  open,
  title,
  users,
  currentUserId,
  onClose,
}) => {
  const [localUsers, setLocalUsers] = useState(users);

  const handleToggleFollow = async (userId: number, index: number) => {
    if (!currentUserId || currentUserId === userId) return;

    try {
      const { data } = await userService.toggleFollow(userId);
      const updatedUsers = [...localUsers];
      updatedUsers[index] = {
        ...updatedUsers[index],
        isFollowing: data.following,
      };
      setLocalUsers(updatedUsers);
    } catch (error: any) {
      toastError(error);
    }
  };

  return (
    <CustomDialog
      title={""}
      open={open}
      onCancel={onClose}
      onConfirm={() => {}}
      hideCancelButton
      hideConfirmButton
      className="sm:max-w-2xl overflow-y-auto"
    >

        <div className="flex flex-col divide-y divide-border">
          {localUsers.map((u, idx) => (
            <div
              key={u.id}
              className="flex items-center justify-between gap-3 py-2 px-2 hover:bg-muted cursor-pointer rounded-md"
            >
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage
                    src={u.avatar || "/placeholder.svg"}
                    alt={u.fullName}
                  />
                  <AvatarFallback>{u.fullName?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-foreground">{u.fullName}</p>
                  <p className="text-sm text-muted-foreground">@{u.username}</p>
                </div>
              </div>

              {currentUserId && currentUserId !== u.id && (
                <Button
                  size="sm"
                  onClick={() => handleToggleFollow(u.id, idx)}
                >
                  {u.isFollowing ? "Following" : "Follow"}
                </Button>
              )}
            </div>
          ))}

          {localUsers.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-4">
              No users found
            </p>
          )}
        </div>
    </CustomDialog>
  );
};

export default FollowUserList;
