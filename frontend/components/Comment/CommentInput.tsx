"use client";

import { useState } from "react";
import { useAppSelector } from "@/redux/hooks";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Send } from "lucide-react";
import { Button } from "../ui/button";
import { toastError } from "@/lib/toast";
import postService from "@/services/post";
import { Comment } from "@/types/post";
import Link from "next/link";

interface CommentInputProps {
  postId: number;
  onSuccess: (comment: Comment) => void;
}

export function CommentInput({ postId, onSuccess }: CommentInputProps) {
  const currentUser = useAppSelector((state) => state.currentUser);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const onComment = async () => {
    if (!content.trim()) return;
    setLoading(true);

    try {
      setLoading(true);
      const { data } = await postService.comment(postId, {
        content,
      });
      onSuccess(data);
      setContent("");
    } catch (error) {
      toastError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-3 items-center">
      <Link href={'#'}>
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
          type="text"
          className="flex-1 bg-transparent border-none outline-none focus:ring-0 focus:border-none active:border-none text-sm placeholder:text-muted-foreground"
          placeholder="Write a comment..."
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
}
