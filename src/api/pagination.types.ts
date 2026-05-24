/**
 * 分页入参
 */
export interface Pagination {
  page: number;
  limit: number;
}

/**
 * 分页查询结果
 */
export interface Paginated<T> {
  items: T[];
  total: number;
}
