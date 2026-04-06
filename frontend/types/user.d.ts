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
  birthday: Date;
  location: string;

  isActive: boolean;
  isVerified: boolean;
  isFollowing: boolean;

  lastLogin: string;

  followerCount: number;
  followingCount: number;
  postCount: number;

  createdAt: string;
  updatedAt: string;

  posts: Post[];
}

export interface UpdateMediaInput {
  avatar?: string;
  cover?: string;
}

export interface UpdateUserResponse {
  user: User;
  accessToken: string;
}
