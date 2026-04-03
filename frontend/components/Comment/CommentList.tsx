"use client";

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import moment from "moment";
import { Heart, MessageCircle, MoreHorizontal, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Comment, Comment as CommentType } from "@/types/post";
import { toastError } from "@/lib/toast";
import Link from "next/link";
import { useAppSelector } from "@/redux/hooks";
import postService from "@/services/post";

interface CommentListProps {
  postId: number;
  comments: Comment[];
  setComments: Dispatch<SetStateAction<Comment[]>>;
}

export function CommentList({
  postId,
  comments,
  setComments,
}: CommentListProps) {
  const currentUser = useAppSelector((state) => state.currentUser);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyValue, setReplyValue] = useState("");
  const [replying, setReplying] = useState(false);

  console.log("comments", comments);
  const toggleLike = async (commentId: number, parentId?: number) => {
    try {
      // await commentService.toggleLike(commentId);
      setComments((prev) =>
        prev.map((c) => {
          if (parentId) {
            if (c.id === parentId) {
              return {
                ...c,
                replies: c.replies?.map((r) =>
                  r.id === commentId
                    ? {
                        ...r,
                        isLiked: !r.isLiked,
                        likeCount: r.isLiked
                          ? r.likeCount - 1
                          : r.likeCount + 1,
                      }
                    : r,
                ),
              };
            }
            return c;
          } else if (c.id === commentId) {
            return {
              ...c,
              isLiked: !c.isLiked,
              likeCount: c.isLiked ? c.likeCount - 1 : c.likeCount + 1,
            };
          }
          return c;
        }),
      );
    } catch (err) {
      toastError(err);
    }
  };

  const onReply = async (parentId: number) => {
    if (!replyValue.trim()) return;
    try {
      setReplying(true);
      console.log("====parentId", parentId);
      const newComment = await postService.comment(postId, {
        content: replyValue,
        parentId,
      });
      setComments((prev) =>
        prev.map((c) =>
          c.id === parentId
            ? { ...c, replies: [...(c.replies || []), newComment] }
            : c
        )
      );
      setReplyValue("");
      setReplyingTo(null);
    } catch (err) {
      toastError(err);
    } finally {
      setReplying(false);
    }
  };

  const deleteComment = async (commentId: number, parentId?: number) => {
    try {
      // await commentService.remove(commentId);
      setComments(
        (prev) =>
          prev
            .map((c) => {
              if (parentId) {
                if (c.id === parentId) {
                  return {
                    ...c,
                    replies: c.replies?.filter((r) => r.id !== commentId),
                  };
                }
                return c;
              } else if (c.id === commentId) {
                return null;
              }
              return c;
            })
            .filter(Boolean) as CommentType[],
      );
    } catch (err) {
      toastError(err);
    }
  };

  if (!comments.length)
    return <p className="text-center py-4">No comments yet</p>;

  return (
    <div className="space-y-4">
      {comments.map((c) => (
        <div key={c.id} className="space-y-2">
          {/* Comment */}
          <div className="flex gap-3 relative">
            <Avatar size="sm">
              <AvatarImage src={c.author.avatar} />
              <AvatarFallback>{c.author.fullName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div className="text-sm font-semibold">{c.author.fullName}</div>
                <DropdownMenu>
                  <DropdownMenuTrigger className="p-1 rounded hover:bg-muted">
                    <MoreHorizontal className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => deleteComment(c.id)}>
                      <Trash2 className="h-4 w-4 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="text-xs text-muted-foreground">
                {moment(c.createdAt).fromNow()}
              </div>
              <p className="text-sm">{c.content}</p>

              <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                <button
                  className={`flex items-center gap-1 ${c.isLiked ? "text-red-500" : ""}`}
                  onClick={() => toggleLike(c.id)}
                >
                  <Heart className="h-3 w-3" />
                  {c.likeCount}
                </button>
                <button
                  className="flex items-center gap-1"
                  onClick={() =>
                    setReplyingTo(replyingTo === c.id ? null : c.id)
                  }
                >
                  <MessageCircle className="h-3 w-3" />
                  Reply
                </button>
              </div>
            </div>
          </div>

          <div className="pl-8 space-y-2">
            {c.replies?.map((r) => (
              <div key={r.id} className="flex gap-3 relative">
                <Link href={`#`}>
                  <Avatar size="sm">
                    <AvatarImage src={r.author.avatar} />
                    <AvatarFallback>
                      {r.author.fullName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div className="text-sm font-semibold">
                      {r.author.fullName}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="p-1 rounded hover:bg-muted">
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onClick={() => deleteComment(r.id, c.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {moment(r.createdAt).fromNow()}
                  </div>
                  <p className="text-sm">{r.content}</p>
                  <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                    <button
                      className={`flex items-center gap-1 ${r.isLiked ? "text-red-500" : ""}`}
                      onClick={() => toggleLike(r.id, c.id)}
                    >
                      <Heart className="h-3 w-3" />
                      {r.likeCount}
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {replyingTo === c.id && (
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  className="flex-1 bg-transparent border-b border-muted px-2 py-1 text-sm outline-none"
                  placeholder="Write a reply..."
                  value={replyValue}
                  onChange={(e) => setReplyValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      onReply(c.id);
                    }
                  }}
                />
                <button
                  className="text-sm text-primary font-semibold hover:text-primary/80 hover:bg-primary/10 rounded px-2 py-1 cursor-pointer transition"
                  onClick={() => onReply(c.id)}
                >
                  Send
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
