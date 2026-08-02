import { useTheme } from "musae";
import styles from "./index.module.css";
import { stringify } from "@aiszlab/relax/class-name";
import { useEffect, useState } from "react";

const ROUTES = [
  {
    d: "M60,140 C120,90 180,40 240,60 C300,80 320,120 360,100",
    delay: 0,
  },
  {
    d: "M40,100 C100,140 160,120 220,90 C280,60 320,80 380,70",
    delay: 0.4,
  },
  {
    d: "M80,80 C140,50 200,100 260,70 C320,40 350,60 400,50",
    delay: 0.8,
  },
];

const DOTS = [
  { cx: 60, cy: 140, routeIndex: 0, isStart: true },
  { cx: 360, cy: 100, routeIndex: 0, isStart: false },
  { cx: 40, cy: 100, routeIndex: 1, isStart: true },
  { cx: 380, cy: 70, routeIndex: 1, isStart: false },
  { cx: 80, cy: 80, routeIndex: 2, isStart: true },
  { cx: 400, cy: 50, routeIndex: 2, isStart: false },
];

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

  return (
    <svg
      viewBox="0 0 440 200"
      className="w-full h-auto"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        filter: isDark ? "drop-shadow(0 0 3px var(--color-primary))" : "none",
      }}
    >
      {ROUTES.map((route, i) => (
        <path
          key={i}
          d={route.d}
          stroke={i === 0 ? colors.primary : i === 1 ? colors.secondary : colors.tertiary}
          strokeWidth={i === 0 ? 2.5 : 1.5}
          strokeLinecap="round"
          className={stringify(styles["route-path"], !reducedMotion && styles["route-path-animate"])}
          style={{
            strokeDasharray: "var(--route-length)",
            strokeDashoffset: reducedMotion ? "0" : "var(--route-length)",
            animationDelay: `${route.delay}s`,
            opacity: i === 0 ? 1 : 0.6,
          }}
        />
      ))}
      {DOTS.map((dot, i) => {
        const isPrimary = dot.routeIndex === 0;
        const fillColor = dot.isStart
          ? colors.primary
          : dot.routeIndex === 0
            ? colors.success
            : colors.primary;
        return (
          <circle
            key={i}
            cx={dot.cx}
            cy={dot.cy}
            r={isPrimary && !dot.isStart ? 5 : 3.5}
            fill={fillColor}
            className={
              !reducedMotion
                ? styles["route-dot-animate"]
                : styles["route-dot"]
            }
            style={{
              animationDelay: !reducedMotion
                ? `${ROUTES[dot.routeIndex].delay + (dot.isStart ? 0 : 1.2)}s`
                : "0s",
            }}
          />
        );
      })}
    </svg>
  );
};

export default RouteAnimation;
