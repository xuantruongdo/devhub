"use client";

import { useState, forwardRef, useImperativeHandle, useRef } from "react";
import { useAppSelector } from "@/redux/hooks";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Send } from "lucide-react";
import { Button } from "../ui/button";
import { toastError } from "@/lib/toast";
import postService from "@/services/post";
import { Comment } from "@/types/post";
import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";

interface CommentInputProps {
  postId: number;
  onSuccess: (comment: Comment) => void;
}

export interface CommentInputRef {
  focus: () => void;
}

export const CommentInput = forwardRef<CommentInputRef, CommentInputProps>(
  ({ postId, onSuccess }, ref) => {
    const currentUser = useAppSelector((state) => state.currentUser);
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);
    const { t, locale, ready } = useTranslation();

    const inputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => ({
      focus: () => {
        inputRef.current?.focus();
      },
    }));

    const onComment = async () => {
      if (!content.trim()) return;
      setLoading(true);

      try {
        const { data } = await postService.comment(postId, { content });
        onSuccess(data);
        setContent("");
      } catch (error) {
        toastError(error);
      } finally {
        setLoading(false);
      }
    };

    if (!ready) return null;

    return (
      <div className="flex gap-3 items-center">
        <Link href={`/${locale}/${currentUser.username}`}>
          <Avatar size="lg">
            {currentUser?.avatar ? (
              <AvatarImage src={currentUser.avatar} />
            ) : (
              <AvatarFallback>
                {currentUser?.fullName?.charAt(0) ?? "?"}
              </AvatarFallback>
            )}
          </Avatar>
        </Link>

        <div className="flex-1 flex items-center gap-2 bg-muted rounded-full px-4 py-2">
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground"
            placeholder={t("comment.placeholder")}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onComment();
              }
            }}
          />
          <Button
            onClick={onComment}
            disabled={!content.trim()}
            className="cursor-pointer"
            loading={loading}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  },
);
