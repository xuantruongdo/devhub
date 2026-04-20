export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ClientError extends Error {
  errorType: string;
}

export interface NavigationRes {
  prevId?: number;
  nextId?: number;
}
