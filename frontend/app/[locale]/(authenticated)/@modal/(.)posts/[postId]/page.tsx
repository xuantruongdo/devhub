"use client";

import postService from "@/services/post";
import { useEffect, useState } from "react";
import { DetailPostDialog } from "@/components/Comment/DetailPostDialog";
import { useParams } from "next/navigation";
import { toastError } from "@/lib/toast";
import { Post } from "@/types/post";

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

  return <DetailPostDialog post={post} />;
}
