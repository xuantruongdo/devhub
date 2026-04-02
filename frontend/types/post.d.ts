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
  likeCount: number;
  commentCount: number;
  shareCount: number;
  createdAt: Date;
  updatedAt: Date;
  author: Author;
}
