import type { TouristPlan } from "../../api/tourist-plan.types";
import type { TouristPlanItinerary } from "../../api/tourist-plan-itinerary.types";
import type { Position } from "../route-map/amap";

export type RouteMode = "driving" | "transit" | "walking";
export type Stop = TouristPlan["attractions"][number];
export interface POI {
  name: string;
  adcode?: string;
  citycode?: string;
  cityname?: string;
  location?: { lng: number; lat: number };
}
interface RouteOption {
  time: number;
  distance: number;
  path?: unknown[];
  steps?: { path?: unknown[]; instruction?: string }[];
  segments?: { instruction?: string }[];
}
export interface RouteResult {
  routes?: RouteOption[];
  plans?: RouteOption[];
}

export function getDistrictStops(
  districtCode: string,
  attractions: Stop[],
  itineraries: Pick<TouristPlanItinerary, "name" | "dayFrom" | "sortOrder">[],
) {
  const ordered = [...itineraries].sort(
    (a, b) => a.dayFrom - b.dayFrom || a.sortOrder - b.sortOrder,
  );
  const rank = (name: string) => {
    const index = ordered.findIndex((item) => item.name.trim() === name.trim());
    return index < 0 ? Infinity : index;
  };
  return attractions
    .filter((item) => item.districtCode === districtCode)
    .sort((a, b) => rank(a.name) - rank(b.name));
}

export function matchAttractionPOI(pois: POI[], stop: Pick<Stop, "name" | "districtCode">) {
  const matches = pois.filter((poi) => {
    const code = stop.districtCode;
    // Province / city codes allow their descendants; county codes require an exact match.
    const prefix = code.endsWith("0000")
      ? code.slice(0, 2)
      : code.endsWith("00")
        ? code.slice(0, 4)
        : code;
    return (
      poi.name.trim() === stop.name.trim() &&
      poi.adcode?.startsWith(prefix) &&
      Number.isFinite(poi.location?.lng) &&
      Number.isFinite(poi.location?.lat)
    );
  });
  if (matches.length !== 1) return null;
  return [matches[0].location!.lng, matches[0].location!.lat] as Position;
}

export function getRouteSummary(mode: RouteMode, result: RouteResult) {
  const route = mode === "transit" ? result.plans?.[0] : result.routes?.[0];
  if (
    !route ||
    !Number.isFinite(route.time) ||
    !Number.isFinite(route.distance) ||
    route.time < 0 ||
    route.distance < 0
  )
    return null;
  return { time: route.time, distance: route.distance };
}

export function getRoutePath(mode: RouteMode, result: RouteResult): unknown[] {
  return mode === "transit"
    ? (result.plans?.[0]?.path ?? [])
    : (result.routes?.[0]?.steps?.flatMap((step) => step.path ?? []) ?? []);
}

export function getRouteInstructions(mode: RouteMode, result: RouteResult) {
  const steps = mode === "transit" ? result.plans?.[0]?.segments : result.routes?.[0]?.steps;
  return (steps ?? []).flatMap((step) => (step.instruction ? [step.instruction] : []));
}
