import { ValueOf } from "@aiszlab/relax/types";

/**
 * 区域级别
 */
const DISTRICT_LEVELS = {
  PROVINCE: "province",
  CITY: "city",
};

type DistrictLevel = ValueOf<typeof DISTRICT_LEVELS>;

export { DISTRICT_LEVELS };
export type { DistrictLevel };
