import { loadAMap, type AMapSDK, type Position } from "../route-map/amap";
import {
  getRouteInstructions,
  getRoutePath,
  getRouteSummary,
  matchAttractionPOI,
  type POI,
  type RouteMode,
  type RouteResult,
  type Stop,
} from "./route";

export interface RouteService {
  search: (
    origin: Position,
    destination: Position,
    callback: (status: string, result: RouteResult) => void,
  ) => void;
  clear: () => void;
}
export interface RoutingSDK extends AMapSDK {
  PlaceSearch: new (options: Record<string, unknown>) => {
    search: (
      name: string,
      callback: (status: string, result: { poiList?: { pois?: POI[] } }) => void,
    ) => void;
  };
  Driving: new (options: Record<string, unknown>) => RouteService;
  Transfer: new (options: Record<string, unknown>) => RouteService;
  Walking: new (options: Record<string, unknown>) => RouteService;
}
let plugins: Promise<RoutingSDK> | undefined;
interface LocatedAttraction {
  position: Position;
  city: string;
}
const locations = new Map<string, LocatedAttraction>();

export async function loadRoutingSDK() {
  const sdk = await loadAMap();
  if (!plugins) {
    plugins = new Promise<RoutingSDK>((resolve, reject) => {
      const timer = window.setTimeout(() => reject(new Error("路线服务加载超时")), 15000);
      sdk.plugin(["AMap.PlaceSearch", "AMap.Driving", "AMap.Transfer", "AMap.Walking"], () => {
        window.clearTimeout(timer);
        resolve(sdk as RoutingSDK);
      });
    }).catch((error) => {
      plugins = undefined;
      throw error;
    });
  }
  return plugins;
}

export function locateAttraction(sdk: RoutingSDK, stop: Stop): Promise<LocatedAttraction> {
  const key = `${stop.districtCode}:${stop.code}:${stop.name}`;
  const cached = locations.get(key);
  if (cached) return Promise.resolve(cached);
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error("景点定位超时")), 10000);
    new sdk.PlaceSearch({
      city: stop.districtCode,
      citylimit: true,
      pageSize: 50,
      extensions: "base",
    }).search(stop.name, (status, result) => {
      window.clearTimeout(timer);
      const position =
        status === "complete" ? matchAttractionPOI(result?.poiList?.pois ?? [], stop) : null;
      if (!position) {
        reject(new Error("无法确认景点位置"));
        return;
      }
      const poi = result.poiList?.pois?.find(
        (item) => item.location?.lng === position[0] && item.location?.lat === position[1],
      );
      const location = { position, city: poi?.citycode || poi?.cityname || "" };
      locations.set(key, location);
      resolve(location);
    });
  });
}

export function createRouteService(sdk: RoutingSDK, mode: RouteMode, city: string) {
  const Service =
    mode === "driving" ? sdk.Driving : mode === "transit" ? sdk.Transfer : sdk.Walking;
  if (mode === "transit" && !city) throw new Error("无法确认公交所在城市");
  // Query without attaching to a map so late responses cannot draw stale routes after switching modes.
  return new Service({ city, cityd: city, extensions: "all" });
}

export function searchRoute(
  service: RouteService,
  mode: RouteMode,
  origin: Position,
  destination: Position,
) {
  return new Promise<{ time: number; distance: number; path: unknown[]; instructions: string[] }>(
    (resolve, reject) => {
      const timer = window.setTimeout(() => {
        service.clear();
        reject(new Error("路线查询超时"));
      }, 15000);
      service.search(origin, destination, (status, result) => {
        window.clearTimeout(timer);
        const summary = status === "complete" ? getRouteSummary(mode, result) : null;
        const path = summary ? getRoutePath(mode, result) : [];
        if (!summary || path.length < 2) {
          reject(new Error(status === "no_data" ? "暂无可用路线" : "路线查询失败"));
          return;
        }
        resolve({ ...summary, path, instructions: getRouteInstructions(mode, result) });
      });
    },
  );
}
