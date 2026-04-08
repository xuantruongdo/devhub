"use client";

import { Post } from "@/types/post";
import PostCard from "@/components/Post/PostCard";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  addUserPost,
  deleteUserPost,
  updateUserPost,
} from "@/redux/reducers/userPosts";
import ComposePost from "../Post/ComposePost";
import { User } from "@/types/user";
import { useTranslation } from "@/hooks/useTranslation";

interface UserPostFeedProps {
  user: User;
  userPosts: Post[];
}

export default function UserPostFeed({ user, userPosts }: UserPostFeedProps) {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.currentUser);
  const { t } = useTranslation();

  return (
    <div className="max-w-4xl mx-auto w-full">
      <div className="shrink-0">
        {user.id === currentUser.id && (
          <ComposePost
            onSuccess={(newPost) => dispatch(addUserPost(newPost))}
          />
        )}
      </div>
      {!userPosts.length ? (
        <div className="text-center py-10 text-muted-foreground">
          {t("post.noPosts")}
        </div>
      ) : (
        <div className="divide-y divide-border">
          {userPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onUpdate={(updated) => dispatch(updateUserPost(updated))}
              onDelete={() => dispatch(deleteUserPost(post.id))}
            />
          ))}
        </div>
      )}
    </div>
  );
}
