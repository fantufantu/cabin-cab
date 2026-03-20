import { AMAP_POI_TYPE_CODE } from "../constants/amap.constant";

/**
 * 查询高德地图景点
 */
function queryTouristAttractions({
  page = 1,
  pageSize = 10,
}: {
  page?: number;
  pageSize?: number;
} = {}) {
  const url = new URL("https://restapi.amap.com/v5/place/text");
  url.searchParams.set("key", "25d429fa4ede69723109774282a8f747");
  url.searchParams.set("types", AMAP_POI_TYPE_CODE.TOURIST_ATTRACTION);
  url.searchParams.set("page_num", page.toString());
  url.searchParams.set("page_size", pageSize.toString());
  url.searchParams.set("city_limit", "true");

  return fetch("");
}

/**
 * 查询高德行政区域
 */
async function queryDistricts({
  adcodes = [],
  page = 1,
}: { adcodes?: string[]; page?: number } = {}) {
  const url = new URL("https://restapi.amap.com/v3/config/district");
  url.searchParams.set("key", "25d429fa4ede69723109774282a8f747");
  url.searchParams.set("subdistrict", (adcodes.length + 1).toString());
  url.searchParams.set("page", page.toString());

  return (await (await fetch(url.toString())).json()).districts;
}

export { queryDistricts, queryTouristAttractions };
