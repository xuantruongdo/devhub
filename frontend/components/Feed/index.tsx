"use client";

import { useState, useEffect } from "react";
import ComposePost from "../ComposePost";
import { Post } from "@/types/post";
import PostCard from "../PostCard";
import postService from "@/services/post";
import { toastError } from "@/lib/toast";

export default function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const { data } = await postService.getFeed();
        setPosts(data);
      } catch (error: any) {
        toastError(error);
      }
    };

    fetchFeed();
  }, []);

  return (
    <div className="flex-1 border-r border-border bg-card overflow-y-auto flex flex-col">
      <ComposePost />

      <div className="flex-1 flex flex-col">
        {posts.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            No posts yet.
          </div>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </div>
    </div>
  );
}
