"use client";

import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import moment from "moment";
import { Heart, MessageCircle, MoreHorizontal, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Comment } from "@/types/post";
import { useAppSelector } from "@/redux/hooks";
import Link from "next/link";
import { ReplyList } from "./ReplyList";
import { useTranslation } from "@/hooks/useTranslation";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { isMe, navigateFromModal } from "@/lib/utils";

interface CommentItemProps {
  postId: number;
  comment: Comment;
  activeCommentId?: number;
  onLike: (commentId: number) => void;
  onDelete: (commentId: number) => void;
  onReply: (parentId: number, content: string) => Promise<void>;
}

export function CommentItem({
  comment: c,
  activeCommentId,
  onLike,
  onDelete,
  onReply,
}: CommentItemProps) {
  const currentUser = useAppSelector((state) => state.currentUser);
  const router = useRouter();
  const [replyContent, setReplyContent] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const replyInputRef = useRef<HTMLInputElement | null>(null);
  const commentRef = useRef<HTMLDivElement | null>(null);
  const { t, locale } = useTranslation();

  const handleReplyToggle = () => {
    const opening = !isReplying;
    setIsReplying(opening);
    if (opening) {
      setTimeout(() => replyInputRef.current?.focus(), 0);
    }
  };

  const handleSendReply = async () => {
    if (!replyContent.trim()) return;
    await onReply(c.id, replyContent);
    setReplyContent("");
    setIsReplying(false);
  };

  const isActive =
    c.id === activeCommentId ||
    c.replies?.some((r) => r.id === activeCommentId);

  useEffect(() => {
    if (c.id === activeCommentId && commentRef.current) {
      commentRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [activeCommentId, c.id]);

  return (
    <div className="space-y-2">
      <div
        ref={commentRef}
        className={`flex gap-3 relative rounded-lg p-2 transition ${
          c.id === activeCommentId ? "border" : ""
        }`}
      >
        <Link
          href={`/${locale}/${c.author.username}`}
          onClick={() =>
            navigateFromModal(router, `/${locale}/${c.author.username}`)
          }
        >
          <Avatar size="sm">
            <AvatarImage src={c.author.avatar} />
            <AvatarFallback>{c.author.fullName.charAt(0)}</AvatarFallback>
          </Avatar>
        </Link>

        <div className="flex-1">
          <div className="flex justify-between items-start">
            <Link
              href={`/${locale}/${c.author.username}`}
              onClick={() =>
                navigateFromModal(router, `/${locale}/${c.author.username}`)
              }
            >
              <div className="flex items-center gap-2">
                <div className="text-sm font-semibold">{c.author.fullName}</div>
                {c.author.isVerified && (
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

            {isMe(c.author.id, currentUser.id) && (
              <DropdownMenu>
                <DropdownMenuTrigger className="p-1 rounded hover:bg-muted">
                  <MoreHorizontal className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={() => onDelete(c.id)}
                    className="text-red-500 focus:text-red-500"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />{" "}
                    {t("comment.actions.delete")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          <div className="text-xs text-muted-foreground">
            {moment(c.createdAt).fromNow()}
          </div>

          <p className="text-sm">{c.content}</p>

          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
            <button
              className="flex items-center group cursor-pointer"
              onClick={() => onLike(c.id)}
            >
              <div className="p-2 group-hover:bg-destructive/10 rounded-full transition">
                <Heart
                  className={`h-4 w-4 transition ${
                    c.isLiked
                      ? "text-red-500 fill-red-500"
                      : "group-hover:text-destructive"
                  }`}
                />
              </div>
              <span
                className={`text-xs sm:text-sm ${
                  c.isLiked ? "text-red-500" : "group-hover:text-destructive"
                }`}
              >
                {c.likeCount}
              </span>
            </button>

            <button
              className="flex items-center group cursor-pointer"
              onClick={handleReplyToggle}
            >
              <div className="p-2 group-hover:bg-primary/10 rounded-full transition">
                <MessageCircle className="h-4 w-4" />
              </div>
              <div className="flex gap-2 items-center">
                <span className="text-xs sm:text-sm">{c.replies.length}</span>
                <span>{t("comment.actions.reply")}</span>
              </div>
            </button>
          </div>

          {isReplying && (
            <div className="flex items-center gap-2 mt-4">
              <input
                ref={replyInputRef}
                type="text"
                className="flex-1 bg-transparent border-b border-muted px-2 py-1 text-sm outline-none"
                placeholder={t("comment.placeholder")}
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSendReply();
                  }
                }}
              />
              <button
                className="text-sm text-primary font-semibold hover:text-primary/80 hover:bg-primary/10 rounded px-2 py-1 cursor-pointer transition"
                onClick={handleSendReply}
              >
                {t("comment.actions.send")}
              </button>
            </div>
          )}

          <ReplyList
            replies={c.replies}
            activeCommentId={activeCommentId}
            onLike={onLike}
            onDelete={onDelete}
          />
        </div>
      </div>
    </div>
  );
}
