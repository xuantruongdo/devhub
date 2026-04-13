"use client";

import { useState } from "react";
import { Comment } from "@/types/post";
import { ReplyItem } from "./ReplyItem";
import { useTranslation } from "@/hooks/useTranslation";

interface ReplyListProps {
  replies: Comment[];
  activeCommentId?: number;
  onLike: (commentId: number) => void;
  onDelete: (commentId: number) => void;
}

export function ReplyList({
  replies,
  activeCommentId,
  onLike,
  onDelete,
}: ReplyListProps) {
  const [showAll, setShowAll] = useState(false);
  const { t } = useTranslation();

  const visibleReplies = showAll ? replies : replies.slice(0, 2);
  const remainingCount = replies.length - 2;

  return (
    <div className="pl-8 space-y-2 mt-4">
      {visibleReplies.map((r) => (
        <ReplyItem
          key={r.id}
          reply={r}
          activeCommentId={activeCommentId}
          onLike={onLike}
          onDelete={onDelete}
        />
      ))}

      {replies.length > 2 && !showAll && (
        <button
          className="text-xs text-muted-foreground hover:underline ml-2"
          onClick={() => setShowAll(true)}
        >
          {t("comment.labels.viewMoreReplies").replace(
            "{{count}}",
            String(remainingCount),
          )}
        </button>
      )}

      {replies.length > 2 && showAll && (
        <button
          className="text-xs text-muted-foreground hover:underline ml-2"
          onClick={() => setShowAll(false)}
        >
          {t("comment.labels.hideReplies")}
        </button>
      )}
    </div>
  );
}
