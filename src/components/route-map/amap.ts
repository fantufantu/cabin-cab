import { useAmapStore } from "../../stores/amap.store";

export type Position = [number, number];
export interface MapInstance {
  add: (overlays: unknown[]) => void;
  setFitView: (
    overlays?: unknown[],
    immediately?: boolean,
    padding?: number[],
    maxZoom?: number,
  ) => void;
  destroy: () => void;
}
interface DistrictResult {
  districtList?: { center: { lng: number; lat: number }; adcode: string; name: string }[];
}
export interface AMapSDK {
  plugin: (names: string[], callback: () => void) => void;
  Map: new (container: HTMLElement, options: Record<string, unknown>) => MapInstance;
  Marker: new (options: Record<string, unknown>) => unknown;
  Polyline: new (options: Record<string, unknown>) => unknown;
  Pixel: new (x: number, y: number) => unknown;
  DistrictSearch: new (options: Record<string, unknown>) => {
    search: (keyword: string, callback: (status: string, result: DistrictResult) => void) => void;
  };
}
type MapWindow = Window & {
  AMap?: AMapSDK;
  _AMapSecurityConfig?: { securityJsCode: string };
};
let sdkPromise: Promise<AMapSDK> | undefined;
const centers = new Map<string, Position>();

export function loadAMap(): Promise<AMapSDK> {
  const host = window as MapWindow;
  if (host.AMap?.DistrictSearch) return Promise.resolve(host.AMap);
  if (sdkPromise) return sdkPromise;
  sdkPromise = initializeAMap().catch((error) => {
    sdkPromise = undefined;
    throw error;
  });
  return sdkPromise;
}

async function initializeAMap(): Promise<AMapSDK> {
  const apiKey = await useAmapStore.state.loadApiKey();
  const { apiSecret } = useAmapStore.state;
  if (!apiKey || !apiSecret) throw new Error("地图凭证暂不可用");
  const host = window as MapWindow;
  return new Promise<AMapSDK>((resolve, reject) => {
    host._AMapSecurityConfig = { securityJsCode: apiSecret };
    const script = document.createElement("script");
    const timer = window.setTimeout(() => finish(new Error("地图加载超时")), 15000);
    const finish = (error?: Error) => {
      window.clearTimeout(timer);
      script.onload = null;
      script.onerror = null;
      if (error || !host.AMap?.DistrictSearch) {
        script.remove();
        reject(error ?? new Error("地图服务不可用"));
      } else resolve(host.AMap);
    };
    script.async = true;
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${encodeURIComponent(apiKey)}&plugin=AMap.DistrictSearch`;
    script.onload = () => finish();
    script.onerror = () => finish(new Error("地图加载失败"));
    document.head.appendChild(script);
  });
}

export function getCityCenter(sdk: AMapSDK, city: { code: string; name: string }) {
  const cached = centers.get(city.code);
  if (cached) return Promise.resolve(cached);
  return new Promise<Position>((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error("城市查询超时")), 10000);

    // 城市名称兼容直辖市的内部城市编码（如 110100）。
    new sdk.DistrictSearch({
      level: city.code.endsWith("00") ? "city" : "district",
      subdistrict: 0,
      extensions: "base",
    }).search(city.code.endsWith("00") ? city.name : city.code, (status, result) => {
      window.clearTimeout(timer);
      const district = result.districtList?.find(
        (item) => item.adcode === city.code || item.name === city.name,
      );
      if (status !== "complete" || !district?.center) {
        reject(new Error(`无法查询${city.name}的位置`));
        return;
      }
      const position: Position = [district.center.lng, district.center.lat];
      centers.set(city.code, position);
      resolve(position);
    });
  });
}
