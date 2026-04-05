"use client";

import postService from "@/services/post";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toastError } from "@/lib/toast";
import { Post } from "@/types/post";
import { DetailPostContent } from "@/components/Comment/DetailPostContent";
import { useTranslation } from "@/hooks/useTranslation";

export default function DetailPostPage() {
  const { postId } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const { locale } = useTranslation();
  const router = useRouter();

  const handleClose = () => router.push(`/${locale}`);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const { data } = await postService.findOne<Post>(Number(postId));
        setPost(data);
      } catch (error: any) {
        toastError(error);
      }
    };

    fetchPost();
  }, [postId]);

  if (!post) return null;

  return (
    <div className="flex justify-center px-4 py-6">
      <div className="w-full max-w-xl">
        <DetailPostContent post={post} onCloseDetailPost={handleClose} />
      </div>
    </div>
  );
}
