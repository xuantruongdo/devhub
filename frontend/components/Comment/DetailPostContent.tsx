"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import {
  Edit,
  Globe,
  Heart,
  Lock,
  MessageCircle,
  MoreHorizontal,
  Share,
  Trash2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import moment from "moment";
import { CommentInput, CommentInputRef } from "./CommentInput";
import { Comment, Post } from "@/types/post";
import postService from "@/services/post";
import { toastError } from "@/lib/toast";
import { CommentList } from "./CommentList";
import { useTranslation } from "@/hooks/useTranslation";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { useModal } from "@/hooks/useModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { ConfirmDeleteDialog } from "../ConfirmDeleteDialog";
import { EditPostDialog } from "../Post/EditPostDialog";
import { deletePost, updatePost } from "@/redux/reducers/feed";
import { navigateFromModal } from "@/lib/utils";
import { useRouter } from "next/navigation";

export const visibilityConfig = {
  public: {
    icon: <Globe className="h-3.5 w-3.5" />,
  },
  private: {
    icon: <Lock className="h-3.5 w-3.5" />,
  },
};

interface DetailPostContentProps {
  post: Post;
  onCloseDetailPost: () => void;
}

export function DetailPostContent({
  post,
  onCloseDetailPost,
}: DetailPostContentProps) {
  const currentUser = useAppSelector((state) => state.currentUser);
  const { t, locale, ready } = useTranslation();
  const {
    author,
    content,
    images,
    visibility,
    createdAt,
    likeCount,
    shareCount,
    isLiked,
  } = post;
  const [comments, setComments] = useState<Comment[]>(post.comments || []);
  const [commentCountState, setCommentCountState] = useState(post.commentCount);
  const [liked, setLiked] = useState(() => isLiked);
  const [likes, setLikes] = useState(() => likeCount);
  const commentInputRef = useRef<CommentInputRef>(null);
  const isAuthor = currentUser?.id === author.id;
  const { isOpen, openModal, closeModal } = useModal();
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const dispatch = useAppDispatch();
  const router = useRouter();

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

  const handleDelete = async () => {
    try {
      await postService.delete(post.id);
      closeModal();
      onCloseDetailPost();

      dispatch(deletePost(post.id));
    } catch (error) {
      toastError(error);
    }
  };

  if (!ready) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={`/${locale}/${author.username}`}
            onClick={() =>
              navigateFromModal(router, `/${locale}/${author.username}`)
            }
          >
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

          <div className="flex flex-col">
            <Link
              href={`/${locale}/${author.username}`}
              onClick={() =>
                navigateFromModal(router, `/${locale}/${author.username}`)
              }
            >
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-foreground">
                  {author.fullName}
                </span>
                {author.isVerified && (
                  <Image
                    src={"/verification-badge.svg"}
                    alt="Verification Badge"
                    width={20}
                    height={20}
                    className="object-cover"
                  />
                )}
              </div>
            </Link>

            <div className="flex items-center gap-1 text-sm text-muted-foreground flex-wrap">
              <span className="truncate max-w-[120px] sm:max-w-none">
                @{author.username}
              </span>

              <span>·</span>

              <span className="whitespace-nowrap">
                {moment(createdAt).fromNow()}
              </span>

              <span>·</span>

              <span className="flex items-center gap-1">
                {visibilityConfig[visibility]?.icon}
              </span>
            </div>
          </div>
        </div>

        {isAuthor && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 hover:bg-primary/10 rounded-full transition text-muted-foreground">
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
        )}
      </div>

      <p>{content}</p>

      {images?.length > 0 && (
        <div
          className={`grid gap-2 ${
            images.length === 1 ? "grid-cols-1" : "grid-cols-2"
          }`}
        >
          {images.map((url, i) => (
            <div
              key={i}
              className="relative w-full aspect-[4/3] overflow-hidden rounded-lg cursor-pointer"
            >
              <Image
                src={url}
                alt={`post image ${i}`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 50vw"
                priority
              />
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-5 text-sm text-muted-foreground border-y py-3">
        <button
          className="flex items-center group cursor-pointer"
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
        <button
          className="flex items-center group cursor-pointer"
          onClick={() => commentInputRef.current?.focus()}
        >
          <div className="p-2 group-hover:bg-primary/10 rounded-full transition">
            <MessageCircle className="h-4 w-4" />
          </div>
          <span className={`text-xs sm:text-sm`}>{commentCountState}</span>
        </button>
        <button className="flex items-center group cursor-pointer">
          <div className="p-2 group-hover:bg-primary/10 rounded-full transition">
            <Share className="h-4 w-4" />
          </div>
          <span className={`text-xs sm:text-sm`}>{shareCount}</span>
        </button>
      </div>

      <CommentInput
        ref={commentInputRef}
        postId={post.id}
        onSuccess={(newComment) => {
          setComments((prev) => [newComment, ...prev]);
          setCommentCountState((prev) => prev + 1);
        }}
      />

      <CommentList
        postId={post.id}
        comments={comments}
        setComments={setComments}
        onCommentDeleted={(deletedCount) =>
          setCommentCountState((prev) => prev - deletedCount)
        }
      />

      <ConfirmDeleteDialog
        open={isOpen}
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
          Object.assign(post, updated);
          dispatch(updatePost(updated));
        }}
      />
    </div>
  );
}
