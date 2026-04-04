import { AMAP_POI_TYPE_CODE } from "../constants/amap.constant";
import { District, Poi } from "./amap.types";

/**
 * 查询高德地图景点
 */
async function queryTouristAttractions({
  page = 1,
  pageSize = 10,
  adcode,
}: {
  page?: number;
  pageSize?: number;
  adcode?: string;
} = {}): Promise<Poi[]> {
  if (!adcode) {
    return [];
  }

  const url = new URL("https://restapi.amap.com/v5/place/text");
  url.searchParams.set("key", import.meta.env.VITE_AMAP_API_KEY);
  url.searchParams.set("types", AMAP_POI_TYPE_CODE.TOURIST_ATTRACTION);
  url.searchParams.set("page_num", page.toString());
  url.searchParams.set("page_size", pageSize.toString());
  url.searchParams.set("city_limit", "true");
  url.searchParams.set("region", adcode);

  return (await (await fetch(url.toString())).json()).pois;
}

/**
 * 查询高德行政区域
 */
async function queryDistricts(): Promise<District[]> {
  const url = new URL("https://restapi.amap.com/v3/config/district");
  url.searchParams.set("key", import.meta.env.VITE_AMAP_API_KEY);
  url.searchParams.set("subdistrict", "1");

  return (await (await fetch(url.toString())).json()).districts;
}

export { queryDistricts, queryTouristAttractions };
