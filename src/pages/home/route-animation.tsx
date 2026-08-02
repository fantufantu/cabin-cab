import { useTheme } from "musae";
import styles from "./index.module.css";
import { stringify } from "@aiszlab/relax/class-name";
import { useEffect, useState } from "react";

/* ====== 城市坐标 ====== */
const CENTER = { cx: 220, cy: 150 };

const CITIES = [
  { id: "chengdu", cx: 55, cy: 45 },
  { id: "beijing", cx: 385, cy: 40 },
  { id: "shanghai", cx: 400, cy: 145 },
  { id: "kunming", cx: 60, cy: 235 },
  { id: "xiamen", cx: 375, cy: 225 },
] as const;

/* ====== 路线定义 ====== */
interface RouteDef {
  d: string;
  delay: number;
  variant: "primary" | "secondary" | "tertiary";
  dashed: boolean;
  particleDelay?: number;
}

const ROUTES: RouteDef[] = [
  {
    d: `M${CENTER.cx},${CENTER.cy} C180,115 120,75 ${CITIES[0].cx},${CITIES[0].cy}`,
    delay: 0.5,
    variant: "primary",
    dashed: false,
    particleDelay: 1.8,
  },
  {
    d: `M${CENTER.cx},${CENTER.cy} C260,100 330,65 ${CITIES[1].cx},${CITIES[1].cy}`,
    delay: 0.65,
    variant: "primary",
    dashed: false,
    particleDelay: 1.95,
  },
  {
    d: `M${CENTER.cx},${CENTER.cy} C280,160 340,150 ${CITIES[2].cx},${CITIES[2].cy}`,
    delay: 0.8,
    variant: "secondary",
    dashed: false,
    particleDelay: 2.1,
  },
  {
    d: `M${CENTER.cx},${CENTER.cy} C170,185 110,215 ${CITIES[3].cx},${CITIES[3].cy}`,
    delay: 0.95,
    variant: "secondary",
    dashed: false,
    particleDelay: 2.25,
  },
  {
    d: `M${CENTER.cx},${CENTER.cy} C270,185 325,210 ${CITIES[4].cx},${CITIES[4].cy}`,
    delay: 1.1,
    variant: "tertiary",
    dashed: false,
    particleDelay: 2.4,
  },
  {
    d: `M${CITIES[0].cx},${CITIES[0].cy} C50,120 55,190 ${CITIES[3].cx},${CITIES[3].cy}`,
    delay: 1.3,
    variant: "tertiary",
    dashed: true,
  },
  {
    d: `M${CITIES[1].cx},${CITIES[1].cy} C410,80 415,120 ${CITIES[2].cx},${CITIES[2].cy}`,
    delay: 1.4,
    variant: "tertiary",
    dashed: true,
  },
];

/* ====== 网格 ====== */
const GRID_H = [70, 140, 210];
const GRID_V = [110, 220, 330];
const GRID_DOTS: [number, number][] = [
  [110, 70], [330, 70],
  [110, 140], [330, 140],
  [110, 210], [220, 210], [330, 210],
];

/* ====== 指南针 ====== */
const COMPASS_CX = 395;
const COMPASS_CY = 260;
const COMPASS_PATH =
  `M${COMPASS_CX},${COMPASS_CY - 9} L${COMPASS_CX + 2.5},${COMPASS_CY - 2.5} L${COMPASS_CX + 9},${COMPASS_CY} L${COMPASS_CX + 2.5},${COMPASS_CY + 2.5} L${COMPASS_CX},${COMPASS_CY + 9} L${COMPASS_CX - 2.5},${COMPASS_CY + 2.5} L${COMPASS_CX - 9},${COMPASS_CY} L${COMPASS_CX - 2.5},${COMPASS_CY - 2.5} Z`;

const RouteAnimation = () => {
  const { colors, mode } = useTheme();
  const [reducedMotion, setReducedMotion] = useState(false);
  const isDark = mode === "dark";

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const routeStroke = (v: RouteDef["variant"]) =>
    v === "primary" ? colors.primary : v === "secondary" ? colors.secondary : colors.tertiary;

  const routeWidth = (v: RouteDef["variant"]) =>
    v === "primary" ? 2.5 : v === "secondary" ? 1.8 : 1.2;

  const routeOpacity = (v: RouteDef["variant"]) =>
    v === "primary" ? 1 : v === "secondary" ? 0.65 : 0.45;

  /* 条件类名：动画 vs 静态 */
  const cx = (staticCls: string | undefined, animCls: string | undefined) =>
    reducedMotion ? staticCls : animCls;

  return (
    <svg
      viewBox="0 0 440 280"
      className="w-full h-auto"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        filter: isDark ? "drop-shadow(0 0 4px var(--color-primary))" : "none",
      }}
      aria-hidden="true"
    >
      {/* ====== 背景网格 ====== */}
      <g
        className={cx(styles["grid-static"], styles["grid-fade-animate"])}
        stroke={colors["outline-variant"]}
        strokeWidth={0.5}
      >
        {GRID_H.map((y) => (
          <line key={`h-${y}`} x1={0} y1={y} x2={440} y2={y} />
        ))}
        {GRID_V.map((x) => (
          <line key={`v-${x}`} x1={x} y1={0} x2={x} y2={280} />
        ))}
        {GRID_DOTS.map(([cx, cy]) => (
          <circle key={`d-${cx}-${cy}`} cx={cx} cy={cy} r={1.2} fill={colors["outline-variant"]} />
        ))}
      </g>

      {/* ====== 路线 ====== */}
      {ROUTES.map((route, i) => (
        <path
          key={`route-${i}`}
          d={route.d}
          stroke={routeStroke(route.variant)}
          strokeWidth={routeWidth(route.variant)}
          strokeLinecap="round"
          strokeDasharray={route.dashed ? "6 8" : undefined}
          opacity={routeOpacity(route.variant)}
          className={cx(styles["route-path-static"], styles["route-path-animate"])}
          style={{
            animationDelay: !reducedMotion ? `${route.delay}s` : "0s",
          }}
        />
      ))}

      {/* ====== 移动粒子 ====== */}
      {ROUTES.filter((r) => r.particleDelay != null).map((route, i) => (
        <path
          key={`particle-${i}`}
          d={route.d}
          stroke={routeStroke(route.variant)}
          strokeWidth={5}
          strokeLinecap="round"
          strokeDasharray="6 600"
          strokeDashoffset={reducedMotion ? -600 : 0}
          className={cx(undefined, styles["particle-animate"])}
          style={{
            animationDelay: !reducedMotion ? `${route.particleDelay}s` : "0s",
          }}
        />
      ))}

      {/* ====== 城市标记 ====== */}
      {CITIES.map((city, i) => (
        <g key={`city-${city.id}`}>
          {[0, 1].map((ring) => (
            <circle
              key={`ring-${ring}`}
              cx={city.cx}
              cy={city.cy}
              r={6}
              fill="none"
              stroke={colors.primary}
              strokeWidth={1}
              className={cx(styles["city-ring-static"], styles["city-ring-animate"])}
              style={{
                animationDelay: !reducedMotion ? `${2.0 + i * 0.12 + ring * 0.55}s` : "0s",
              }}
            />
          ))}
          <circle
            cx={city.cx}
            cy={city.cy}
            r={4.5}
            fill={colors["primary-container"]}
            stroke={colors.primary}
            strokeWidth={1.5}
            className={cx(styles["city-dot-static"], styles["city-dot-animate"])}
            style={{
              animationDelay: !reducedMotion ? `${1.8 + i * 0.1}s` : "0s",
              transformOrigin: `${city.cx}px ${city.cy}px`,
            }}
          />
        </g>
      ))}

      {/* ====== 中心枢纽 ====== */}
      <g>
        <circle
          cx={CENTER.cx}
          cy={CENTER.cy}
          r={12}
          fill="none"
          stroke={colors.primary}
          strokeWidth={1.5}
          className={cx(styles["hub-pulse-static"], styles["hub-pulse-animate"])}
          style={{ animationDelay: "0.3s" }}
        />
        <circle
          cx={CENTER.cx}
          cy={CENTER.cy}
          r={6}
          fill={colors.primary}
          className={cx(styles["hub-dot-static"], styles["hub-dot-animate"])}
        />
        <circle
          cx={CENTER.cx}
          cy={CENTER.cy}
          r={3}
          fill={colors["on-primary"]}
          opacity={0.85}
        />
      </g>

      {/* ====== 指南针 ====== */}
      <g
        className={cx(styles["compass-static"], styles["compass-animate"])}
        style={{ transformOrigin: `${COMPASS_CX}px ${COMPASS_CY}px` }}
      >
        <path d={COMPASS_PATH} fill={colors["outline-variant"]} />
      </g>
    </svg>
  );
};

export default RouteAnimation;
