"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, Edit2, Link2, MapPin, ShieldCheck } from "lucide-react";
import { User } from "@/types/user";
import moment from "moment";
import RightSidebarProfile from "./RightSidebarProfile";
import Image from "next/image";
import { useAppSelector } from "@/redux/hooks";
import { FollowType, UserRole } from "@/constants";
import UserPostFeed from "./UserPostFeed";
import userService from "@/services/user";
import { useModal } from "@/hooks/useModal";
import EditProfileDialog from "./EditProfileDialog";
import UserFollowDialog from "./UserFollowDialog";
import { uploadStorage } from "@/lib/utils";
import { toastError, toastSuccess } from "@/lib/toast";
import { useTranslation } from "@/hooks/useTranslation";

interface ProfileProps {
  user: User;
}

export default function Profile({ user }: ProfileProps) {
  const { t, ready } = useTranslation();

  const currentUser = useAppSelector((state) => state.currentUser);
  const userPosts = useAppSelector((state) => state.userPosts);
  const isMe = currentUser?.id === user.id;
  const [preview, setPreview] = useState<string | null>(null);

  const [isFollowing, setIsFollowing] = useState(user.isFollowing);
  const [followerCount, setFollowerCount] = useState(user.followerCount);

  const [followDialogTab, setFollowDialogTab] = useState<FollowType>(
    FollowType.FOLLOWER,
  );

  const { isOpen, openModal, closeModal } = useModal();
  const {
    isOpen: isOpenFollow,
    openModal: openModalFollow,
    closeModal: closeModalFollow,
  } = useModal();

  const openFollowDialog = (tab: FollowType) => {
    setFollowDialogTab(tab);
    openModalFollow();
  };

  const handleFollow = async () => {
    if (isMe) return;
    setIsFollowing((prev) => !prev);

    try {
      const { data } = await userService.toggleFollow(user.id);

      setIsFollowing(data.following);
      if (data.followerCount !== undefined) {
        setFollowerCount(data.followerCount);
      }
    } catch (error: any) {
      setIsFollowing((prev) => !prev);
      toastError(error);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !isMe) return;

    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    try {
      const uploadedFiles = await uploadStorage([file]);
      const { data } = await userService.updateMedia(user.id, {
        avatar: uploadedFiles[0],
      });

      localStorage.setItem("accessToken", data.accessToken);
      toastSuccess(t("profile.avatarUpdatedSuccess"));
    } catch (error: any) {
      toastError(error);
    }
  };

  if (!ready) return null;

  return (
    <div className="h-full min-h-screen flex overflow-hidden">
      <div className="flex-1 min-h-0 border-r border-border bg-card overflow-y-auto">
        <div className="w-full h-48 relative">
          <img
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=400&fit=crop"
            alt="Cover"
            className="w-full h-full object-cover"
          />
          {isMe && (
            <button className="absolute top-4 right-4 p-2 bg-black/50 rounded-full hover:bg-black/70 transition">
              <Edit2 className="w-5 h-5 text-white" />
            </button>
          )}
        </div>

        <div className="px-6 pb-6">
          <div className="relative -mt-20 mb-6 flex items-end justify-between">
            <div className="relative w-fit">
              <Avatar className="w-32 h-32 border-4 border-card">
                <AvatarImage
                  src={preview || user.avatar || "/placeholder.svg"}
                  alt={user.fullName}
                />
                <AvatarFallback>
                  {user.fullName?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>

              {isMe && (
                <>
                  <label
                    htmlFor="avatar-input"
                    className="absolute bottom-2 right-2 p-2 rounded-full bg-black hover:bg-black/80 cursor-pointer transition"
                  >
                    <Edit2 className="w-4 h-4 text-white" />
                  </label>
                  <input
                    id="avatar-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </>
              )}
            </div>

            {!isMe && (
              <Button
                onClick={handleFollow}
                className={`transition-all duration-200 ${
                  isFollowing
                    ? "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                }`}
              >
                {isFollowing
                  ? t("profile.followingLabel")
                  : t("profile.follow")}
              </Button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-2 flex-1">
              <h1 className="text-3xl font-bold text-foreground">
                {user.fullName}
              </h1>
              {user.isVerified && (
                <Image
                  src="/verification-badge.svg"
                  alt="Verified"
                  width={20}
                  height={20}
                />
              )}
              {user.role === UserRole.ADMIN && (
                <div className="inline-flex max-w-max items-center gap-1 px-2 py-1 rounded-full bg-red-500/10 text-red-500 text-xs font-medium">
                  <ShieldCheck className="w-3 h-3" />
                  {t("profile.admin")}
                </div>
              )}
            </div>

            {isMe && (
              <div className="flex-shrink-0">
                <Button size="sm" variant="outline" onClick={openModal}>
                  {t("profile.editProfile")}
                </Button>
              </div>
            )}
          </div>

          <p className="text-lg text-muted-foreground">@{user.username}</p>
          {user.bio && (
            <p className="mt-1 text-base text-foreground">{user.bio}</p>
          )}

          <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
            {user.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" /> {user.location}
              </div>
            )}
            {user.website && (
              <a
                href={user.website}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 hover:text-primary"
              >
                <Link2 className="w-4 h-4" /> {user.website}
              </a>
            )}
            {user.birthday && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {moment(user.birthday).format("DD/MM/YYYY")}
              </div>
            )}
          </div>

          <div className="flex gap-6 mt-4">
            <button
              onClick={() => openFollowDialog(FollowType.FOLLOWER)}
              className="hover:underline underline-offset-2"
            >
              <span className="font-bold">{followerCount}</span>
              <span className="ml-2 text-muted-foreground">
                {t("profile.followers")}
              </span>
            </button>
            <button
              onClick={() => openFollowDialog(FollowType.FOLLOWING)}
              className="hover:underline underline-offset-2"
            >
              <span className="font-bold">{user.followingCount}</span>
              <span className="ml-2 text-muted-foreground">
                {t("profile.following")}
              </span>
            </button>
          </div>

          <div className="w-full h-px bg-border my-6" />

          <UserPostFeed user={user} userPosts={userPosts} />
        </div>
      </div>

      <RightSidebarProfile />

      <EditProfileDialog
        user={user}
        open={isOpen}
        onClose={closeModal}
        onUpdated={(updatedUser) => Object.assign(user, updatedUser)}
      />

      <UserFollowDialog
        user={user}
        open={isOpenFollow}
        defaultTab={followDialogTab}
        onClose={closeModalFollow}
      />
    </div>
  );
}
