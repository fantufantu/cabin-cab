import { TouristPlanItinerary } from "./tourist-plan-itinerary.types";

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
  cityCodes: string[];
  cities: {
    code: string;
    name: string;
  }[];
  depatureAt: number;
  attractionCodes: string[];
  attractions: {
    code: string;
    name: string;
    cityCode: string;
  }[];
  duration: number;
  proposal?: string;
  belongToId: string;
  plan?: PlanDetail;
  itineraries?: TouristPlanItinerary[];
}

/**
 * 创建出行计划输入
 */
export type CreateTouristPlanInput = Pick<
  TouristPlan,
  "depatureAt" | "attractionCodes" | "cityCodes" | "duration" | "belongToId"
>;

/**
 * 当天出行计划个数查询变量
 */
export interface CountTouristPlansTodayVariables {
  belongToId: string;
}

/**
 * 当天出行计划个数
 */
export interface CountTouristPlansTodayResponse {
  countTouristPlansToday: number;
}
