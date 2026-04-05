"use client";

import { Dispatch, SetStateAction } from "react";
import { Comment } from "@/types/post";
import { toastError } from "@/lib/toast";
import postService from "@/services/post";
import { CommentItem } from "./CommentItem";
import { useTranslation } from "@/hooks/useTranslation";

interface CommentListProps {
  postId: number;
  comments: Comment[];
  setComments: Dispatch<SetStateAction<Comment[]>>;
  onCommentDeleted: (count: number) => void;
}

export function CommentList({
  postId,
  comments,
  setComments,
  onCommentDeleted,
}: CommentListProps) {
  const { ready } = useTranslation();

  const updateLikeRecursive = (
    comment: Comment,
    commentId: number,
  ): Comment => {
    if (comment.id === commentId) {
      const newLiked = !comment.isLiked;
      return {
        ...comment,
        isLiked: newLiked,
        likeCount: newLiked
          ? comment.likeCount + 1
          : Math.max(0, comment.likeCount - 1),
      };
    }
    return {
      ...comment,
      replies: comment.replies?.map((r) => updateLikeRecursive(r, commentId)),
    };
  };

  const syncLikeRecursive = (
    comment: Comment,
    commentId: number,
    liked: boolean,
  ): Comment => {
    if (comment.id === commentId) {
      return { ...comment, isLiked: liked };
    }
    return {
      ...comment,
      replies: comment.replies?.map((r) =>
        syncLikeRecursive(r, commentId, liked),
      ),
    };
  };

  const handleLike = async (commentId: number) => {
    try {
      setComments((prev) => prev.map((c) => updateLikeRecursive(c, commentId)));
      const { data } = await postService.likeComment(commentId);
      setComments((prev) =>
        prev.map((c) => syncLikeRecursive(c, commentId, data.liked)),
      );
    } catch (err) {
      toastError(err);
    }
  };

  const handleReply = async (parentId: number, content: string) => {
    try {
      const { data } = await postService.comment(postId, { content, parentId });
      setComments((prev) =>
        prev.map((c) =>
          c.id === data.parentId
            ? { ...c, replies: [data, ...(c.replies || [])] }
            : c,
        ),
      );
    } catch (err) {
      toastError(err);
    }
  };

  const handleDelete = async (commentId: number) => {
    try {
      await postService.removeComment(commentId);

      let deletedCount = 0;

      const removeCommentRecursive = (list: Comment[]): Comment[] =>
        list
          .filter((c) => {
            if (c.id === commentId) {
              deletedCount += 1 + (c.replies?.length || 0);
              return false;
            }
            return true;
          })
          .map((c) => ({
            ...c,
            replies: c.replies ? removeCommentRecursive(c.replies) : [],
          }));

      setComments((prev) => removeCommentRecursive(prev));

      if (deletedCount > 0) {
        onCommentDeleted(deletedCount);
      }
    } catch (err) {
      toastError(err);
    }
  };

  if (!ready) return null;

  return (
    <div className="space-y-4">
      {comments.map((c) => (
        <CommentItem
          key={c.id}
          postId={postId}
          comment={c}
          onLike={handleLike}
          onDelete={handleDelete}
          onReply={handleReply}
        />
      ))}
    </div>
  );
}
