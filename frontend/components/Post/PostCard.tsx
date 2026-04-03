"use client";

import {
  Heart,
  MessageCircle,
  Share,
  MoreHorizontal,
  CircleCheck,
  Edit,
  Trash2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Post } from "@/types/post";
import moment from "moment";
import Link from "next/link";
import Image from "next/image";
import { useAppSelector } from "@/redux/hooks";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../ui/dropdown-menu";
import { ConfirmDeleteDialog } from "../ConfirmDeleteDialog";
import { useModal } from "@/hooks/useModal";
import { toastError } from "@/lib/toast";
import postService from "@/services/post";
import { useState } from "react";
import { ImageLightbox } from "./ImageLightbox";
import { EditPostDialog } from "./EditPostDialog";
import { useTranslation } from "@/hooks/useTranslation";

interface PostCardProps {
  post: Post;
  onUpdate: (post: Post) => void;
  onDelete: () => void;
}

export default function PostCard({ post, onUpdate, onDelete }: PostCardProps) {
  const currentUser = useAppSelector((state) => state.currentUser);
  const { t, ready } = useTranslation();
  const {
    author,
    content,
    images,
    createdAt,
    likeCount,
    commentCount,
    shareCount,
    isLiked,
  } = post;
  const [liked, setLiked] = useState(() => isLiked);
  const [likes, setLikes] = useState(() => likeCount);

  const isAuthor = currentUser?.id === author.id;
  const { isOpen: isDialogOpen, openModal, closeModal } = useModal();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const handleDelete = async () => {
    try {
      await postService.delete(post.id);
      onDelete();
    } catch (error) {
      toastError(error);
    }
  };

  const handleLike = async () => {
    try {
      setLiked((prev) => !prev);
      setLikes((prev) => (liked ? prev - 1 : prev + 1));

      await postService.like(post.id);
    } catch (error) {
      setLiked(isLiked);
      setLikes(likeCount);
      toastError(error);
    }
  };

  if (!ready) return null;

  return (
    <article className="border-b border-border px-4 sm:px-6 py-4 hover:bg-muted/30 transition">
      <div className="flex gap-3 sm:gap-4">
        <Link href={"#"}>
          <Avatar size="lg">
            {author.avatar ? (
              <AvatarImage src={author.avatar} alt={author.fullName} />
            ) : (
              <AvatarFallback>
                {author.fullName.charAt(0).toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-wrap">
              <div className="flex items-center gap-1">
                <Link href={"#"} className="font-bold text-foreground truncate">
                  {author.fullName}
                </Link>
                {author.isVerified && (
                  <CircleCheck className="h-4 w-4 text-blue-500 flex-shrink-0" />
                )}
              </div>
              <p className="text-muted-foreground truncate hidden sm:block">
                {author.username}
              </p>
              <span className="text-muted-foreground hidden sm:block">·</span>
              <p className="text-muted-foreground whitespace-nowrap text-sm">
                {moment(createdAt).fromNow()}
              </p>
            </div>

            {isAuthor && (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-2 hover:bg-primary/10 rounded-full transition text-muted-foreground flex-shrink-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => setSelectedPost(post)}
                      className="flex items-center gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      {t("post.edit")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={openModal}
                      className="flex items-center gap-2 text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                      {t("post.delete")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <ConfirmDeleteDialog
                  open={isDialogOpen}
                  title={t("post.deleteTitle")}
                  description={t("post.deleteDescription")}
                  onCancel={closeModal}
                  onConfirm={handleDelete}
                  cancelText={t("post.cancelButton")}
                  confirmText={t("post.deleteButton")}
                />

                <EditPostDialog
                  key={post.id}
                  open={selectedPost !== null}
                  post={selectedPost ?? post}
                  onCancel={() => setSelectedPost(null)}
                  onSuccess={(updated) => {
                    setSelectedPost(null);
                    onUpdate(updated);
                  }}
                />
              </>
            )}
          </div>

          <p className="mt-2 text-base text-foreground leading-relaxed">
            {content}
          </p>

          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {images &&
              images.slice(0, 2).map((url, i) => {
                const isLast = i === 1 && images.length > 2;
                return (
                  <div
                    key={i}
                    className="relative w-full aspect-[4/3] overflow-hidden rounded-lg cursor-pointer"
                    onClick={() => setLightboxIndex(i)}
                  >
                    <Image
                      src={url}
                      alt={`post image ${i}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, 50vw"
                      priority
                    />
                    {isLast && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-lg">
                        <span className="text-white text-2xl font-semibold">
                          +{images.length - 1}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>

          <div className="flex justify-between mt-4 max-w-xs text-muted-foreground text-sm">
            <Link
              href={`/posts/${post.id}`}
              className="flex items-center gap-2 group flex-1 cursor-pointer"
              scroll={false}
            >
              <div className="p-2 group-hover:bg-primary/10 rounded-full transition">
                <MessageCircle className="h-4 w-4 group-hover:text-primary" />
              </div>
              <span className="text-xs sm:text-sm group-hover:text-primary">
                {commentCount}
              </span>
            </Link>

            <button className="flex items-center gap-2 group flex-1 cursor-pointer">
              <div className="p-2 group-hover:bg-primary/10 rounded-full transition">
                <Share className="h-4 w-4 group-hover:text-primary" />
              </div>
              <span className="text-xs sm:text-sm group-hover:text-primary">
                {shareCount}
              </span>
            </button>

            <button
              className="flex items-center gap-2 group flex-1 cursor-pointer"
              onClick={handleLike}
            >
              <div className="p-2 group-hover:bg-destructive/10 rounded-full transition">
                <Heart
                  className={`h-4 w-4 transition ${
                    liked
                      ? "text-red-500 fill-red-500"
                      : "group-hover:text-destructive"
                  }`}
                />
              </div>
              <span
                className={`text-xs sm:text-sm ${
                  liked ? "text-red-500" : "group-hover:text-destructive"
                }`}
              >
                {likes}
              </span>
            </button>
          </div>
        </div>
      </div>

      {lightboxIndex !== null && (
        <ImageLightbox
          images={images ?? []}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </article>
  );
}
