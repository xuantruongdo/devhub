"use client";

import { useEffect } from "react";
import { toastError } from "@/lib/toast";
import postService from "@/services/post";
import ComposePost from "../Post/ComposePost";
import PostCard from "../Post/PostCard";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  setFeed,
  addPost,
  updatePost,
  deletePost,
} from "@/redux/reducers/feed";
import { useTranslation } from "@/hooks/useTranslation";

export default function Feed() {
  const dispatch = useAppDispatch();
  const posts = useAppSelector((state) => state.feed);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const { data } = await postService.getFeed();
        dispatch(setFeed(data));
      } catch (error: any) {
        toastError(error);
      }
    };

    fetchFeed();
  }, [dispatch]);

  return (
    <div className="flex-1 min-h-0 border-r border-border bg-card flex flex-col">
      <div className="shrink-0">
        <ComposePost onSuccess={(newPost) => dispatch(addPost(newPost))} />
      </div>

      <div className="flex-1 overflow-y-auto">
        {posts.length === 0 ? (
          <div className="flex items-center justify-center h-24 text-muted-foreground">
            {t("post.noPosts")}
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onUpdate={(updated) => dispatch(updatePost(updated))}
              onDelete={() => dispatch(deletePost(post.id))}
            />
          ))
        )}
      </div>
    </div>
  );
}
