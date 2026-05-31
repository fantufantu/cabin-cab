interface PlanDetail {
  attractions: {
    attractionName: string;
    planAt: number;
    planGap: number;
    attractionDescription: string;
    tip: string;
  }[];
}

/**
 * 出行计划类型声明
 */
export interface TouristPlan {
  id: string;
  cities: {
    code: string;
    name: string;
  }[];
  depatureAt: number;
  attractions: {
    code: string;
    name: string;
    cityCode: string;
  }[];
  duration: number;
  proposal?: string;
  belongToId: string;
  plan?: PlanDetail;
}

/**
 * 创建出行计划输入
 */
export type CreateTouristPlanInput = Pick<
  TouristPlan,
  "depatureAt" | "attractions" | "cities" | "duration" | "belongToId"
>;
