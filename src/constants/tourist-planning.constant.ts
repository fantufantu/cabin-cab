export type TouristPlanningFlowKey = "districts" | "period" | "attractions" | "route";

interface TouristPlanningFlowStep {
  path: string | null;
  step: number;
  label: string;
  title: string;
  subTitle: string;
  next: TouristPlanningFlowKey | null;
}

export const TOURIST_PLANNING_FLOW = new Map<TouristPlanningFlowKey, TouristPlanningFlowStep>([
  ["districts", {
    path: "/tourist-planning/districts",
    step: 1,
    label: "城市",
    title: "选择目的地",
    subTitle: "支持选择多个城市，可连续勾选",
    next: "period",
  }],
  ["period", {
    path: "/tourist-planning/period",
    step: 2,
    label: "日期",
    title: "计划周期",
    subTitle: "选择旅游周期",
    next: "attractions",
  }],
  ["attractions", {
    path: "/tourist-planning/attractions",
    step: 3,
    label: "景点",
    title: "景点",
    subTitle: "选择您喜欢的景点",
    next: null,
  }],
  ["route", {
    path: null,
    step: 4,
    label: "路线",
    title: "路线",
    subTitle: "查看规划路线",
    next: null,
  }],
]);

export const getTouristPlanningFlowStep = (key: TouristPlanningFlowKey) => {
  const step = TOURIST_PLANNING_FLOW.get(key);

  if (!step) {
    throw new Error(`Unknown tourist planning step: ${key}`);
  }

  return step;
};

export const getNextTouristPlanningPath = (key: "districts" | "period") => {
  const nextKey = getTouristPlanningFlowStep(key).next;

  if (!nextKey) {
    throw new Error(`Tourist planning step has no next route: ${key}`);
  }

  const nextPath = getTouristPlanningFlowStep(nextKey).path;

  if (!nextPath) {
    throw new Error(`Tourist planning step has no route path: ${nextKey}`);
  }

  return nextPath;
};
