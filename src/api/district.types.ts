/**
 * 地区数据结构（服务端）
 */
export interface District {
  code: string;
  name: string;
  image: string;
}

/**
 * 地区列表筛选入参
 */
export interface FilterDistrictsInput {
  keyword?: string;
}
