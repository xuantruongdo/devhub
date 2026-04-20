export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export type DashboardStats = {
  totalUsers: number;
  activeUsers: number;
  verifiedUsers: number;
  totalPosts: number;
  newUsersToday: number;
  newPostsToday: number;
};
