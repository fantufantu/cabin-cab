/**
 * 高德地区数据结构
 */
export interface District {
  adcode: string;
  center: string;
  districts: District[];
  level: string;
  name: string;
}
