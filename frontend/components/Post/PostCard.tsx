"use client";

import {
  Heart,
  MessageCircle,
  Share,
  MoreHorizontal,
  Edit,
  Trash2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Post } from "@/types/post";
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
import { visibilityConfig } from "../Comment/DetailPostContent";
import { formatFromNow } from "@/lib/utils";

interface PostCardProps {
  post: Post;
  onUpdate: (post: Post) => void;
  onDelete: () => void;
}

export default function PostCard({ post, onUpdate, onDelete }: PostCardProps) {
  const currentUser = useAppSelector((state) => state.currentUser);
  const { t, locale, ready } = useTranslation();

  const {
    author,
    content,
    images,
    visibility,
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
    <article className="border-b border-border px-4 py-5 hover:bg-muted/30 transition">
      <div className="flex gap-3">
        <Link href={`/${locale}/${author.username}`}>
          <Avatar size="lg" className="mt-1">
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
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <div className="flex items-center gap-1 flex-wrap">
                <Link
                  href={`/${locale}/${author.username}`}
                  className="font-semibold text-foreground hover:underline"
                >
                  {author.fullName}
                </Link>

                {author.isVerified && (
                  <Image
                    src="/verification-badge.svg"
                    alt="verified"
                    width={16}
                    height={16}
                  />
                )}

                <span className="text-muted-foreground text-sm">
                  @{author.username}
                </span>

                <span className="text-muted-foreground text-sm">·</span>

                <span className="text-muted-foreground text-sm">
                  {formatFromNow(createdAt, locale)}
                </span>

                <span className="text-muted-foreground text-sm">·</span>

                {visibilityConfig[visibility]?.icon}
              </div>
            </div>

            {isAuthor && (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-2 rounded-full hover:bg-primary/10 transition">
                      <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => setSelectedPost(post)}
                      className="flex items-center gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      {t("post.editLabel")}
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={openModal}
                      className="flex items-center gap-2 text-destructive"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                      {t("post.deleteLabel")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <ConfirmDeleteDialog
                  open={isDialogOpen}
                  title={t("post.delete.title")}
                  description={t("post.delete.description")}
                  onCancel={closeModal}
                  onConfirm={handleDelete}
                  cancelText={t("post.delete.cancelButton")}
                  confirmText={t("post.delete.deleteButton")}
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

          {content && (
            <p className="mt-2 text-[15px] leading-relaxed whitespace-pre-line">
              {content}
            </p>
          )}

          {images && images.length > 0 && (
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
                        sizes="(max-width: 768px) 100vw, 50vw"
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
          )}

          <div className="flex justify-between mt-4 max-w-md text-muted-foreground">
            <button
              onClick={handleLike}
              className="flex items-center gap-1 group"
            >
              <div className="p-2 rounded-full group-hover:bg-destructive/10 transition">
                <Heart
                  className={`h-4 w-4 ${
                    liked
                      ? "text-red-500 fill-red-500"
                      : "group-hover:text-destructive"
                  }`}
                />
              </div>
              <span
                className={`text-sm ${
                  liked ? "text-red-500" : "group-hover:text-destructive"
                }`}
              >
                {likes}
              </span>
            </button>

            <Link
              href={`/${locale}/posts/${post.id}`}
              className="flex items-center gap-1 group"
              scroll={false}
            >
              <div className="p-2 rounded-full group-hover:bg-primary/10 transition">
                <MessageCircle className="h-4 w-4" />
              </div>
              <span className="text-sm">{commentCount}</span>
            </Link>

            <button className="flex items-center gap-1 group">
              <div className="p-2 rounded-full group-hover:bg-primary/10 transition">
                <Share className="h-4 w-4" />
              </div>
              <span className="text-sm">{shareCount}</span>
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
