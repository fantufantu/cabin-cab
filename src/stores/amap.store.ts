import { using } from "@aiszlab/relax/react";
import { queryDistricts } from "../api/amap.api";
import { District } from "../api/amap.types";

interface AmapStore {
  districts: Map<string, District>;
  queryDistricts: () => Promise<District[]>;
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
  };
});

export default useAmapStore;
