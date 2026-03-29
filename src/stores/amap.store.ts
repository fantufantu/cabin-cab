import { using } from "@aiszlab/relax/react";
import { queryDistricts, queryTouristAttractions } from "../api/amap.api";
import { District, Poi } from "../api/amap.types";

interface AmapStore {
  districts: Map<string, District>;
  queryDistricts: () => Promise<District[]>;
  queryTouristAttractions: (adcode: string) => Promise<Poi[]>;
}

const useAmapStore = using<AmapStore>((setStore) => {
  return {
    districts: new Map(),

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
      const res = await queryTouristAttractions({
        adcode,
      });

      console.log("res=====", res);

      return res;
    },
  };
});

export default useAmapStore;
