"use client";

import postService from "@/services/post";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toastError } from "@/lib/toast";
import { Post } from "@/types/post";
import { DetailPostContent } from "@/components/Comment/DetailPostContent";

export default function DetailPostPage() {
  const { postId } = useParams();
  const [post, setPost] = useState<Post | null>(null);

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
        <DetailPostContent post={post} />
      </div>
    </div>
  );
}
