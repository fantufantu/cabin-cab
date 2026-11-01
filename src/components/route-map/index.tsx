import { useEffect, useRef, useState } from "react";
import { getCityCenter, loadAMap } from "./amap";

interface Props {
  cities: { code: string; name: string }[];
  onSelectCity?: (code: string) => void;
  onReorder?: (codes: string[]) => void;
}

export default function RouteMap({ cities, onReorder, onSelectCity }: Props) {
  const selectCity = useRef(onSelectCity);
  selectCity.current = onSelectCity;
  const container = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState("正在加载城市路线…");
  const [hasMapKey, setHasMapKey] = useState(true);
  const [retry, setRetry] = useState(0);
  const cityKey = JSON.stringify(cities.map(({ code, name }) => ({ code, name })));

  useEffect(() => {
    if (JSON.parse(cityKey).length === 0) return;
    setHasMapKey(true);
    let cancelled = false;
    let destroy: (() => void) | undefined;
    setStatus("正在加载城市路线…");
    const selected: { code: string; name: string }[] = JSON.parse(cityKey);
    const renderMap = async () => {
      const sdk = await loadAMap();
      const positions = await Promise.all(selected.map((city) => getCityCenter(sdk, city)));
      if (cancelled || !container.current) return;
      const map = new sdk.Map(container.current, { viewMode: "2D", zoom: 5, resizeEnable: true });
      destroy = () => map.destroy();
      const color = getComputedStyle(container.current).getPropertyValue("--color-primary").trim();
      const markers = positions.map((position, index) => {
        const badge = document.createElement(selectCity.current ? "button" : "div");
        if (badge instanceof HTMLButtonElement) {
          badge.type = "button";
          badge.setAttribute("aria-label", `查看${selected[index].name}景点路线`);
          badge.onclick = () => selectCity.current?.(selected[index].code);
        }
        badge.textContent = String(index + 1);
        badge.style.cssText = `background:${color};color:var(--color-on-primary);border-radius:50%;width:30px;height:30px;display:grid;place-items:center;font-weight:700;box-shadow:0 2px 8px #0003`;
        return new sdk.Marker({
          position,
          title: selected[index].name,
          content: badge,
          offset: new sdk.Pixel(-15, -15),
        });
      });
      const overlays =
        positions.length > 1
          ? [
              ...markers,
              new sdk.Polyline({
                path: positions,
                strokeColor: color,
                strokeWeight: 4,
                showDir: true,
              }),
            ]
          : markers;
      map.add(overlays);
      map.setFitView(overlays, true, [45, 35, 45, 35], 10);
      setStatus("");
    };

    void renderMap().catch(() => {
      destroy?.();
      destroy = undefined;
      if (!cancelled) {
        setHasMapKey(false);
        setStatus("地图暂不可用，已显示路线示意");
      }
    });
    return () => {
      cancelled = true;
      destroy?.();
    };
  }, [cityKey, retry]);

  const move = (index: number, offset: number) => {
    const codes = cities.map(({ code }) => code);
    [codes[index], codes[index + offset]] = [codes[index + offset], codes[index]];
    onReorder?.(codes);
  };

  if (cities.length === 0) return null;

  return (
    <section
      className="overflow-hidden rounded-3xl border border-color-outline-variant bg-color-surface-container-low"
      aria-label="城市路线预览"
    >
      <div className="flex items-center justify-between gap-3 p-4">
        <div>
          <h2 className="font-medium">旅程路线</h2>
          <p className="mt-1 text-xs text-color-on-surface-variant">
            {hasMapKey
              ? onReorder
                ? "城市连线示意 · 可调整游览顺序"
                : "城市连线示意 · 按计划顺序展示"
              : "城市路线顺序示意"}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-color-primary-container px-3 py-1 text-xs">
          {cities.length} 座城市
        </span>
      </div>
      {hasMapKey ? (
        <div className="relative">
          <div ref={container} className="h-72 w-full" aria-label="已选城市地图" />
          {status && (
            <div
              role="status"
              className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-color-surface-container-low p-6 text-center text-sm"
            >
              {status}
              {!status.includes("正在") && (
                <button
                  type="button"
                  className="text-color-primary"
                  onClick={() => setRetry((value) => value + 1)}
                >
                  重新加载
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="mx-4 mb-3 rounded-2xl bg-color-primary-container px-5 py-6">
          <p className="mb-4 text-xs text-color-on-surface-variant">路线顺序示意（非地理位置）</p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-4" aria-hidden="true">
            {cities.map((city, index) => (
              <div key={city.code} className="flex items-center gap-3">
                {index > 0 && <span className="text-color-primary">→</span>}
                <div className="flex items-center gap-2">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-color-primary text-color-on-primary text-xs">
                    {index + 1}
                  </span>
                  <span className="text-sm">{city.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {!hasMapKey && (
        <div
          role="status"
          className="flex items-center justify-between gap-3 px-4 pb-3 text-xs text-color-on-surface-variant"
        >
          <span>{status}</span>
          <button
            type="button"
            className="shrink-0 text-color-primary"
            onClick={() => setRetry((value) => value + 1)}
          >
            重新加载地图
          </button>
        </div>
      )}
      <ol className="flex flex-col gap-2 p-4 pt-2">
        {cities.map((city, index) => (
          <li key={city.code} className="flex items-center gap-3">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-color-primary-container text-xs">
              {index + 1}
            </span>
            <div className="flex-1 text-sm">
              {onSelectCity ? (
                <button
                  type="button"
                  onClick={() => onSelectCity(city.code)}
                  className="min-h-10 text-color-primary"
                  aria-label={`查看${city.name}景点路线`}
                >
                  {city.name} · 查看景点路线
                </button>
              ) : (
                city.name
              )}
              {index === 0 && (
                <span className="ml-2 text-xs text-color-on-surface-variant">首站</span>
              )}
            </div>
            {onReorder && (
              <>
                <button
                  type="button"
                  aria-label={`上移${city.name}`}
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                  className="h-10 w-10 rounded-full text-color-primary disabled:opacity-25"
                >
                  ↑
                </button>
                <button
                  type="button"
                  aria-label={`下移${city.name}`}
                  disabled={index === cities.length - 1}
                  onClick={() => move(index, 1)}
                  className="h-10 w-10 rounded-full text-color-primary disabled:opacity-25"
                >
                  ↓
                </button>
              </>
            )}
          </li>
        ))}
      </ol>
      <p className="px-4 pb-4 text-xs text-color-on-surface-variant">
        {cities.length === 1
          ? onReorder
            ? "再选一座城市，即可查看城市间连线"
            : "本次行程仅包含一座城市"
          : "连线仅示意城市游览顺序，不代表实际交通路线"}
      </p>
    </section>
  );
}
