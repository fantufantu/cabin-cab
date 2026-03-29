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

/**
 * 高德周边数据结构
 */
export interface Poi {
  adcode: string;
  address: string;
  adname: string;
  citycode: string;
  cityname: string;
  distance: string;
  id: string;
  location: string;
  name: string;
  parent: string;
  pcode: string;
  pname: string;
  type: string;
  typecode: string;
}
