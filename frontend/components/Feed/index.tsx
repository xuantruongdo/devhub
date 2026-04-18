"use client";

import { useEffect, useState, useRef, useCallback } from "react";
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
import { PostSkeleton } from "../Post/PostSkeleton";

export default function Feed() {
  const dispatch = useAppDispatch();
  const posts = useAppSelector((state) => state.feed);
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);

  const fetchFeed = async () => {
    try {
      setLoading(true);
      const { data } = await postService.getFeed();

      dispatch(setFeed(data.posts));
      setCursor(data.nextCursor);
      setHasMore(!!data.nextCursor);
    } catch (error: any) {
      toastError(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMore = useCallback(async () => {
    if (!cursor || loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);
      const { data } = await postService.getFeed({ cursor });

      dispatch(setFeed([...posts, ...data.posts]));

      setCursor(data.nextCursor);
      setHasMore(!!data.nextCursor);
    } catch (error: any) {
      toastError(error);
    } finally {
      setLoadingMore(false);
    }
  }, [cursor, loadingMore, hasMore, posts, dispatch]);

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;

    const threshold = 200;

    if (el.scrollHeight - el.scrollTop - el.clientHeight < threshold) {
      fetchMore();
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  return (
    <div className="flex-1 min-h-0 border-r border-border bg-card flex flex-col">
      <div className="shrink-0">
        <ComposePost onSuccess={(newPost) => dispatch(addPost(newPost))} />
      </div>

      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto"
      >
        {loading ? (
          <>
            <PostSkeleton />
            <PostSkeleton />
          </>
        ) : posts.length === 0 ? (
          <div className="flex items-center justify-center h-24 text-muted-foreground">
            {t("post.noPosts")}
          </div>
        ) : (
          <>
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onUpdate={(updated) => dispatch(updatePost(updated))}
                onDelete={() => dispatch(deletePost(post.id))}
              />
            ))}

            {loadingMore && (
              <>
                <PostSkeleton />
              </>
            )}

            {!hasMore && (
              <div className="text-center text-muted-foreground py-4">
                {t("post.noMorePosts")}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
