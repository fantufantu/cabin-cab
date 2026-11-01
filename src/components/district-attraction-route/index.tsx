import { useEffect, useRef, useState } from "react";
import type { Position } from "../route-map/amap";
import {
  createRouteService,
  loadRoutingSDK,
  locateAttraction,
  searchRoute,
  type RouteService,
} from "./amap";
import type { RouteMode, Stop } from "./route";

interface Props {
  district: { code: string; name: string };
  stops: Stop[];
  onBack: () => void;
}
interface Leg {
  time?: number;
  distance?: number;
  error?: string;
  instructions?: string[];
}
const MODES: { key: RouteMode; label: string }[] = [
  { key: "driving", label: "自驾" },
  { key: "transit", label: "公共交通" },
  { key: "walking", label: "步行" },
];
const duration = (seconds: number) => {
  const minutes = Math.max(1, Math.ceil(seconds / 60));
  return minutes < 60
    ? `${minutes} 分钟`
    : `${Math.floor(minutes / 60)} 小时${minutes % 60 ? ` ${minutes % 60} 分钟` : ""}`;
};
const distance = (meters: number) =>
  meters < 1000 ? `${Math.round(meters)} 米` : `${(meters / 1000).toFixed(1)} 公里`;

export default function DistrictAttractionRoute({ district, stops, onBack }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<RouteMode>("driving");
  const [retry, setRetry] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [positions, setPositions] = useState<(Position | null)[] | null>(null);
  const [legs, setLegs] = useState<Leg[]>([]);
  const stopsKey = JSON.stringify(stops);

  useEffect(() => {
    const selected: Stop[] = JSON.parse(stopsKey);
    if (selected.length === 0) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    let destroy: (() => void) | undefined;
    const services: RouteService[] = [];
    setLoading(true);
    setError("");
    setPositions(null);
    setLegs([]);

    const render = async () => {
      const sdk = await loadRoutingSDK();
      // Keep failed stops in place so a missing location never creates a shortcut between its neighbours.
      const locations = await Promise.all(
        selected.map((stop) => locateAttraction(sdk, stop).catch(() => null)),
      );
      const points = locations.map((location) => location?.position ?? null);
      if (cancelled || !container.current) return;
      setPositions(points);
      if (!points.some(Boolean)) throw new Error("暂时无法确认景点位置，请稍后重试");
      const map = new sdk.Map(container.current, { viewMode: "2D", zoom: 13, resizeEnable: true });
      destroy = () => map.destroy();
      const markers = points.flatMap((position, index) => {
        if (!position) return [];
        const badge = document.createElement("div");
        badge.textContent = String(index + 1);
        badge.style.cssText =
          "background:var(--color-primary);color:var(--color-on-primary);border-radius:50%;width:30px;height:30px;display:grid;place-items:center;font-weight:700";
        return [
          new sdk.Marker({
            position,
            title: selected[index].name,
            content: badge,
            offset: new sdk.Pixel(-15, -15),
          }),
        ];
      });
      map.add(markers);
      map.setFitView(markers, true, [45, 35, 45, 35], 15);
      const result: Leg[] = [];
      // Query consecutive legs in order to avoid bursting the map service quota.
      await points.slice(1).reduce(async (previous, destination, index) => {
        await previous;
        if (cancelled) return;
        const origin = points[index];
        if (!origin || !destination) {
          result.push({ error: "景点位置未确认，无法规划此路段" });
        } else {
          const leg = await Promise.resolve()
            .then(() => {
              const service = createRouteService(sdk, mode, locations[index]?.city ?? "");
              services.push(service);
              return searchRoute(service, mode, origin, destination);
            })
            .catch((reason: unknown) => ({
              error: reason instanceof Error ? reason.message : "路线查询失败",
            }));
          if (!cancelled && "path" in leg) {
            const color = getComputedStyle(container.current!)
              .getPropertyValue("--color-primary")
              .trim();
            map.add([
              new sdk.Polyline({
                path: leg.path,
                strokeColor: color,
                strokeWeight: 5,
                showDir: true,
              }),
            ]);
          }
          result.push(leg);
        }
        if (!cancelled) setLegs([...result]);
      }, Promise.resolve());
      if (cancelled) return;
      map.setFitView(undefined, true, [45, 35, 45, 35], 15);
      setLoading(false);
    };
    void render().catch(() => {
      if (!cancelled) {
        setError("地图或路线服务暂不可用，请稍后重试");
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
      services.forEach((service) => {
        service.clear();
      });
      destroy?.();
    };
  }, [stopsKey, district.code, mode, retry]);

  const complete =
    stops.length > 1 && legs.length === stops.length - 1 && legs.every((leg) => !leg.error);
  const total = legs.reduce<{ time: number; distance: number }>(
    (sum, leg) => ({
      time: sum.time + (leg.time ?? 0),
      distance: sum.distance + (leg.distance ?? 0),
    }),
    { time: 0, distance: 0 },
  );
  const label = MODES.find((item) => item.key === mode)!.label;

  return (
    <section className="flex flex-col gap-4" aria-label={`${district.name}景点路线`}>
      <button
        type="button"
        className="self-start min-h-10 text-sm text-color-primary"
        onClick={onBack}
      >
        ← 返回城市总览
      </button>
      <div>
        <h2 className="text-lg font-semibold">{district.name} · 景点路线</h2>
        <p className="mt-1 text-sm text-color-on-surface-variant">
          本次计划的 {stops.length} 个景点 · 景点顺序仅供参考，请结合每日行程出行
        </p>
      </div>
      {stops.length === 0 ? (
        <p className="rounded-2xl bg-color-surface-container-low p-6 text-sm">
          本次计划未选择该城区的景点
        </p>
      ) : (
        <>
          <div className="flex gap-2" role="group" aria-label="出行方式">
            {MODES.map((item) => (
              <button
                key={item.key}
                type="button"
                aria-pressed={mode === item.key}
                onClick={() => setMode(item.key)}
                className={`flex-1 rounded-full px-3 py-3 text-sm ${mode === item.key ? "bg-color-primary text-color-on-primary" : "bg-color-surface-container-low text-color-on-surface"}`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="overflow-hidden rounded-3xl border border-color-outline-variant bg-color-surface-container-low">
            <div
              ref={container}
              className="h-80 w-full"
              aria-label={`${district.name}${label}路线地图`}
            />
            <div className="flex flex-col gap-2 p-4 text-sm" role="status" aria-live="polite">
              {loading
                ? "正在查询景点位置与路线…"
                : error ||
                  (stops.length === 1
                    ? "仅一个景点，无需规划景点间路线"
                    : complete
                      ? `${label}全程约 ${distance(total.distance)} · ${duration(total.time)}`
                      : "部分路段暂无可用路线，请查看下方提示")}
              {!loading && (error || (!complete && stops.length > 1)) && (
                <button
                  type="button"
                  className="self-start min-h-10 text-color-primary"
                  onClick={() => setRetry((value) => value + 1)}
                >
                  重新查询
                </button>
              )}
              <p className="text-xs text-color-on-surface-variant">
                耗时不含景点游览和停留；公共交通为当前查询时的参考方案。
              </p>
            </div>
          </div>
          <ol className="flex flex-col gap-3">
            {stops.map((stop, index) => (
              <li key={stop.code} className="rounded-2xl border border-color-outline-variant p-4">
                <div className="flex items-center gap-3">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-color-primary-container text-xs">
                    {index + 1}
                  </span>
                  <span className="font-medium">{stop.name}</span>
                </div>
                {positions && !positions[index] && (
                  <p className="mt-2 text-sm text-color-error">
                    无法确认该景点位置，未参与路线规划
                  </p>
                )}
                {index < stops.length - 1 && (
                  <p className="mt-3 text-sm text-color-on-surface-variant">
                    前往 {stops[index + 1].name}：
                    {legs[index]?.error ??
                      (legs[index]?.time !== undefined
                        ? `${label}约 ${duration(legs[index].time!)} · ${distance(legs[index].distance!)}`
                        : loading
                          ? "正在查询…"
                          : "暂无路线")}
                  </p>
                )}
                {!!legs[index]?.instructions?.length && (
                  <details className="mt-3 text-sm text-color-on-surface-variant">
                    <summary className="cursor-pointer min-h-8">查看路段指引</summary>
                    <ol className="mt-2 flex list-decimal flex-col gap-2 pl-5">
                      {legs[index].instructions!.map((instruction, step) => (
                        <li key={step}>{instruction}</li>
                      ))}
                    </ol>
                  </details>
                )}
              </li>
            ))}
          </ol>
        </>
      )}
    </section>
  );
}
