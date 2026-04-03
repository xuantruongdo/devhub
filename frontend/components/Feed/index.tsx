"use client";

import { useState, useEffect } from "react";
import { Post } from "@/types/post";
import postService from "@/services/post";
import { toastError } from "@/lib/toast";
import ComposePost from "../Post/ComposePost";
import PostCard from "../Post/PostCard";

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

  const handleUpdatePost = (updated: Post) => {
    setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handleDeletePost = (id: number) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="flex-1 border-r border-border bg-card overflow-y-auto flex flex-col">
      <ComposePost
        onSuccess={(newPost: Post) => setPosts((prev) => [newPost, ...prev])}
      />

      <div className="flex-1 flex flex-col">
        {posts.length === 0 ? (
          <div className="flex items-center justify-center h-24 text-muted-foreground">
            No posts yet.
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onUpdate={handleUpdatePost}
              onDelete={() => handleDeletePost(post.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
