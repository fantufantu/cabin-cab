export interface TouristPlanItinerary {
  id: string;
  dayFrom: number;
  sortOrder: number;
  name: string;
  description: string;
  tip: string;
  duration: number;
}

/**
 * 更新行程明细输入
 */
export type UpdateTouristPlanItineraryInput = Partial<
  Pick<TouristPlanItinerary, "name" | "description" | "tip" | "duration">
>;
