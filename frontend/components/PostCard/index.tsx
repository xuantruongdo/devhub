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

interface PostCardProps {
  post: Post;
  onEdit?: (post: Post) => void;
  onDelete?: () => void;
}

export default function PostCard({ post, onEdit, onDelete }: PostCardProps) {
  const currentUser = useAppSelector((state) => state.currentUser);
  const {
    author,
    content,
    images,
    createdAt,
    likeCount,
    commentCount,
    shareCount,
  } = post;

  const isAuthor = currentUser?.id === author.id;
  const { isOpen: isDialogOpen, openModal, closeModal } = useModal();

  const handleDelete = async () => {
    try {
      await postService.delete(post.id);
      onDelete?.();
    } catch (error) {
      toastError(error);
    }
  };

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
                      onClick={() => onEdit?.(post)}
                      className="flex items-center gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={openModal}
                      className="flex items-center gap-2 text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <ConfirmDeleteDialog
                  isOpen={isDialogOpen}
                  onOpenChange={closeModal}
                  onConfirm={handleDelete}
                />
              </>
            )}
          </div>

          <p className="mt-2 text-base text-foreground leading-relaxed">
            {content}
          </p>

          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {images &&
              images.map((url, i) => (
                <div
                  key={i}
                  className="w-full relative overflow-hidden rounded-lg"
                >
                  <Image
                    src={url}
                    alt={`post image ${i}`}
                    width={800}
                    height={600}
                    className="w-full h-auto max-h-[600px] object-contain"
                    sizes="(max-width: 640px) 100vw, 50vw"
                  />
                </div>
              ))}
          </div>

          <div className="flex justify-between mt-4 max-w-xs text-muted-foreground text-sm">
            <button className="flex items-center gap-2 group flex-1">
              <div className="p-2 group-hover:bg-primary/10 rounded-full transition">
                <MessageCircle className="h-4 w-4 group-hover:text-primary" />
              </div>
              <span className="text-xs sm:text-sm group-hover:text-primary">
                {commentCount}
              </span>
            </button>

            <button className="flex items-center gap-2 group flex-1">
              <div className="p-2 group-hover:bg-primary/10 rounded-full transition">
                <Share className="h-4 w-4 group-hover:text-primary" />
              </div>
              <span className="text-xs sm:text-sm group-hover:text-primary">
                {shareCount}
              </span>
            </button>

            <button className="flex items-center gap-2 group flex-1">
              <div className="p-2 group-hover:bg-destructive/10 rounded-full transition">
                <Heart className="h-4 w-4 group-hover:text-destructive" />
              </div>
              <span className="text-xs sm:text-sm group-hover:text-destructive">
                {likeCount}
              </span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
