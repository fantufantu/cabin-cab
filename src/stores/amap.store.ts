import { using } from "@aiszlab/relax/react";
import { queryAttractions } from "../api/attraction.api";
import { queryCities } from "../api/city.api";
import type { City } from "../api/city.types";
import type { Attraction } from "../api/attraction.types";
import { isUndefined, toArray } from "@aiszlab/relax";

interface AmapStore {
  cities: Map<string, City>;
  touristAttractions: Map<string, Map<string, Attraction>>;
  queryCities: () => Promise<City[]>;
  queryAttractions: (cityCode?: string) => Promise<Attraction[]>;
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
     * 查询景点数据，优先使用内存中已经记录的数据
     * 如果内存中无有效数据，使用 API 调用远程接口
     */
    queryAttractions: async (cityCode): Promise<Attraction[]> => {
      if (isUndefined(cityCode)) {
        return [];
      }

      const existingAttractions = useAmapStore.state.touristAttractions.get(cityCode);
      if (existingAttractions && existingAttractions?.size > 0) {
        return toArray(existingAttractions?.values());
      }

      const attractions = await queryAttractions(cityCode).catch(() => []);

      setStore(({ touristAttractions, ...store }) => {
        const nextTouristAttractions = new Map(touristAttractions);
        const validAttractions = nextTouristAttractions.get(cityCode) ?? new Map();
        nextTouristAttractions.set(cityCode, validAttractions);

        attractions.forEach((attraction) => {
          validAttractions.set(attraction.code, attraction);
        });

        return {
          touristAttractions: nextTouristAttractions,
          ...store,
        };
      });

      return attractions;
    },
  };
});

export default useAmapStore;
