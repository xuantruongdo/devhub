import { PostVisibility } from "@/constants";

export interface Author {
  id: number;
  username: string;
  fullName: string;
  email: string;
  avatar: string;
  isVerified: boolean;
}

export interface Post {
  id: number;
  authorId: number;
  content: string;
  images: string[];
  visibility: PostVisibility;
  comments: Comment[];
  likeCount: number;
  commentCount: number;
  shareCount: number;
  createdAt: Date;
  updatedAt: Date;
  author: Author;
  isLiked: boolean;
}

export interface PostInput {
  content: string;
  images: string[];
  visibility: PostVisibility;
}

export interface Comment {
  id: number;
  content: string;
  author: Author;
  likeCount: number;
  createdAt: Date;
  isLiked: boolean;
  replies: Comment[];
}

export interface CommentInput {
  content: string;
  parentId?: number;
}

export type VisibilityOption = {
  label: string;
  value: PostVisibility;
  icon?: React.ReactNode;
};
