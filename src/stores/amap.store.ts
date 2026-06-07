import { using } from "@aiszlab/relax/react";
import { queryCities, queryTouristAttractions } from "../api/amap.api";
import type { City, Poi } from "../api/amap.types";
import { isUndefined, toArray } from "@aiszlab/relax";

interface AmapStore {
  cities: Map<string, City>;
  touristAttractions: Map<string, Map<string, Poi>>;
  queryCities: () => Promise<City[]>;
  queryTouristAttractions: (adcode?: string) => Promise<Poi[]>;
}

const useAmapStore = using<AmapStore>((setStore) => {
  return {
    cities: new Map(),

    touristAttractions: new Map(),

    /**
     * 查询城市数据，并更新全局缓存
     * 借助缓存避免服务端重复请求
     */
    queryCities: async (): Promise<City[]> => {
      const existingCities = useAmapStore.state.cities;
      if (existingCities.size > 0) {
        return toArray(existingCities.values());
      }

      const _cities = await queryCities();

      setStore(({ cities, ...store }) => {
        const nextCities = new Map(cities);
        _cities.forEach((item) => {
          nextCities.set(item.code, item);
        });

        return {
          ...store,
          cities: nextCities,
        };
      });

      return _cities;
    },

    /**
     * 查询景点数据，有限使用内存中已经记录的数据
     * 如果内存中无有效数据，使用 API 调用远程接口
     */
    queryTouristAttractions: async (adcode): Promise<Poi[]> => {
      if (isUndefined(adcode)) {
        return [];
      }

      const existingPois = useAmapStore.state.touristAttractions.get(adcode);
      if ((existingPois?.size ?? 0) > 0) {
        return toArray(existingPois?.values());
      }

      const pois = await queryTouristAttractions({
        adcode,
      }).catch(() => []);

      setStore(({ touristAttractions, ...store }) => {
        const nextTouristAttractions = new Map(touristAttractions);
        const validPois = nextTouristAttractions.get(adcode) ?? new Map();
        nextTouristAttractions.set(adcode, validPois);

        pois.forEach((poi) => {
          validPois.set(poi.id, poi);
        });

        return {
          touristAttractions: nextTouristAttractions,
          ...store,
        };
      });

      return pois;
    },
  };
});

export default useAmapStore;
