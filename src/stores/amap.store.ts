import { using } from "@aiszlab/relax/react";
import { queryDistricts } from "../api/amap.api";

interface AmapStore {
  districts: Map<string, string>;
  queryDistricts: () => boolean;
}

const useAmapStore = using<AmapStore>((setStore) => {
  return {
    districts: new Map(),

    /**
     * 查询地区数据，并更新全局缓存
     * 借助缓存避免高德配额消费过多
     */
    queryDistricts: () => {
      queryDistricts().then((res) => {
        console.log("res===", res);
      });
      return true;
    },
  };
});

export default useAmapStore;
