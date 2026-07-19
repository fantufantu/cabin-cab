/**
 * 城市数据结构（服务端）
 */
export interface City {
  code: string;
  name: string;
  image: string;
}

/**
 * 城市列表筛选入参
 */
export interface FilterCitiesInput {
  keyword?: string;
}
