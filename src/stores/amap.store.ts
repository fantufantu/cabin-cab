import { using } from "@aiszlab/relax/react";
import { queryDistricts, queryTouristAttractions } from "../api/amap.api";
import { District, Poi } from "../api/amap.types";

interface AmapStore {
  districts: Map<string, District>;
  touristAttractions: Map<string, Map<string, Poi>>;
  queryDistricts: () => Promise<District[]>;
  queryTouristAttractions: (adcode: string) => Promise<Poi[]>;
}

const useAmapStore = using<AmapStore>((setStore) => {
  return {
    districts: new Map(),

    touristAttractions: new Map(),

    /**
     * 查询地区数据，并更新全局缓存
     * 借助缓存避免高德配额消费过多
     */
    queryDistricts: async () => {
      const _districts = (await queryDistricts()).at(0)?.districts ?? [];

      _districts?.forEach((item) => {
        setStore((store) => {
          return {
            ...store,
            districts: store.districts.set(item.adcode, item),
          };
        });
      });

      return _districts;
    },

    /**
     * 查询景点数据，有限使用内存中已经记录的数据
     * 如果内存中无有效数据，使用 API 调用远程接口
     */
    queryTouristAttractions: async (adcode: string) => {
      const pois = await queryTouristAttractions({
        adcode,
      }).catch(() => []);

      setStore((store) => {
        const validPois = store.touristAttractions.get(adcode) ?? new Map();
        store.touristAttractions.set(adcode, validPois);

        pois.forEach((poi) => {
          validPois.set(poi.id, poi);
        });

        return {
          ...store,
        };
      });

      return pois;
    },
  };
});

export default useAmapStore;
