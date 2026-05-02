// shared/types/PaginatedResult.ts

// Соответствует PaginatedResult<T> на бэке.
export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
