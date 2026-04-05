import { Post } from "./post";

export interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: string;
  avatar: string;
  bio: string;
  website: string;
  birthday: string;
  location: string;

  isActive: boolean;
  isVerified: boolean;

  lastLogin: string;

  followerCount: number;
  followingCount: number;
  postCount: number;

  createdAt: string;
  updatedAt: string;

  posts: Post[];
}
