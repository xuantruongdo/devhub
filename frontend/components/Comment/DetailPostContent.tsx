"use client";

import { useState } from "react";
import Image from "next/image";
import { CircleCheck, Heart, MessageCircle, Share } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import moment from "moment";
import { CommentInput } from "./CommentInput";
import { Comment, Post } from "@/types/post";
import postService from "@/services/post";
import { toastError } from "@/lib/toast";
import { CommentList } from "./CommentList";
import { ImageLightbox } from "../Post/ImageLightbox";

interface DetailPostContentProps {
  post: Post;
}

export function DetailPostContent({ post }: DetailPostContentProps) {
  const { author, content, images, createdAt, likeCount, shareCount, isLiked } =
    post;
  const [comments, setComments] = useState<Comment[]>(post.comments || []);
  const [commentCountState, setCommentCountState] = useState(post.commentCount);
  const [liked, setLiked] = useState(() => isLiked);
  const [likes, setLikes] = useState(() => likeCount);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Avatar size="lg">
          {author.avatar ? (
            <AvatarImage src={author.avatar} alt={author.fullName} />
          ) : (
            <AvatarFallback>
              {author.fullName.charAt(0).toUpperCase()}
            </AvatarFallback>
          )}
        </Avatar>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold">{author.fullName}</span>
            {author.isVerified && (
              <CircleCheck className="h-4 w-4 text-blue-500" />
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {author.username} · {moment(createdAt).fromNow()}
          </p>
        </div>
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
              onClick={() => {
                setLightboxIndex(i);
                setLightboxOpen(true);
              }}
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

      {lightboxOpen && (
        <ImageLightbox
          images={images}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
        />
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

        <span className="flex items-center gap-1">
          <MessageCircle className="h-4 w-4" /> {commentCountState}
        </span>
        <span className="flex items-center gap-1">
          <Share className="h-4 w-4" /> {shareCount}
        </span>
      </div>

      <CommentInput
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
      />
    </div>
  );
}
