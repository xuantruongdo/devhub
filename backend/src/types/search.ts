export interface SearchUsersParams {
  q: string;
  from?: number;
  size?: number;
  verified?: boolean;
}

export interface UserHit {
  id: number;
  username: string;
  fullName: string;
  bio: string | null;
  avatar: string | null;
  isVerified: boolean;
  followerCount: number;
  score: number;
}

export interface SearchUsersResult {
  hits: UserHit[];
  total: number;
  took: number;
}
