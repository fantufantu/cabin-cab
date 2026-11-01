import { DistrictLevel } from "../constants/district.constant";

export interface District {
  code: string;
  name: string;
  image: string;
  level: DistrictLevel;
  parentCode: string;
}

/**
 * 地区列表筛选入参
 */
export interface FilterDistrictsInput {
  keyword?: string;
}
