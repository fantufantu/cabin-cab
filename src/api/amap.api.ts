import { gql, TypedDocumentNode } from "@apollo/client";
import { AMAP_POI_TYPE_CODE } from "../constants/amap.constant";
import type { City, Poi } from "./amap.types";
import type { Paginated } from "./pagination.types";
import { client } from "./index";

/**
 * 查询城市列表
 */
const CITIES: TypedDocumentNode<
  {
    cities: Paginated<City>;
  },
  {
    pagination: { page: number; limit: number };
    filter?: { keyword?: string };
  }
> = gql`
  query Cities($pagination: Pagination!, $filter: FilterCitiesInput) {
    cities(pagination: $pagination, filter: $filter) {
      items {
        code
        name
        image
      }
      total
    }
  }
`;

/**
 * 查询城市（分页，一页查询全部）
 */
async function queryCities(): Promise<City[]> {
  const { data } = await client.query({
    query: CITIES,
    variables: {
      pagination: { page: 1, limit: 999 },
    },
  });

  return data?.cities?.items ?? [];
}

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

export { queryCities, queryTouristAttractions };
