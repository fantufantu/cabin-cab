interface PlanDetail {
  attractions: {
    attractionName: string;
    planAt: number;
    planGap: number;
    attractionDescription: string;
    tip: string;
  }[];
}

export interface ItineraryItem {
  itineraryName: string;
  itineraryDescription: string;
  itineraryTip: string;
  itineraryStartAt: number;
  itineraryDuration: number;
}

export interface Itinerary {
  items: ItineraryItem[];
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
  itinerary?: Itinerary;
}

/**
 * 创建出行计划输入
 */
export type CreateTouristPlanInput = Pick<
  TouristPlan,
  "depatureAt" | "attractionCodes" | "cityCodes" | "duration" | "belongToId"
>;
