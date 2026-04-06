import { using } from "@aiszlab/relax/react";
import { queryDistricts, queryTouristAttractions } from "../api/amap.api";
import { District, Poi } from "../api/amap.types";
import { isUndefined, toArray } from "@aiszlab/relax";

interface AmapStore {
  districts: Map<string, District>;
  touristAttractions: Map<string, Map<string, Poi>>;
  queryDistricts: () => Promise<District[]>;
  queryTouristAttractions: (adcode?: string) => Promise<Poi[]>;
}

const useAmapStore = using<AmapStore>((setStore) => {
  return {
    districts: new Map(),

    touristAttractions: new Map(),

    /**
     * 查询地区数据，并更新全局缓存
     * 借助缓存避免高德配额消费过多
     */
    queryDistricts: async (): Promise<District[]> => {
      const existingDistricts = useAmapStore.state.districts;
      if (existingDistricts.size > 0) {
        return toArray(existingDistricts.values());
      }

      const _districts = (await queryDistricts()).at(0)?.districts ?? [];

      setStore(({ districts, ...store }) => {
        const nextDistricts = new Map(districts);
        _districts.forEach((item) => {
          nextDistricts.set(item.adcode, item);
        });

        return {
          ...store,
          districts: nextDistricts,
        };
      });

      return _districts;
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
