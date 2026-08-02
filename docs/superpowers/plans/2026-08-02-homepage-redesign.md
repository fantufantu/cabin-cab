# 首页美化 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 美化 H5 首页，用 SVG 路线动画 + musae color token 实现"活力探索"品牌氛围，完整支持明暗主题切换。

**Architecture:** 在现有 theme infra 上补充 CSS 变量映射，新增 SVG 路线动画组件，重写首页结构和样式。全部颜色通过 musae token → CSS var 链路，零硬编码色值。

**Tech Stack:** React 19, TypeScript, musae (M3 theme), Tailwind CSS v4, CSS modules (animation)

## Global Constraints

- 所有颜色必须使用 musae color token（`useTheme().colors` 或 `--color-*` CSS 变量），禁止硬编码 hex 色值
- 暗黑/白昼模式自动适配，无需额外逻辑
- 移动端 H5 优先，safe-area 适配保留
- 尊重 `prefers-reduced-motion: reduce`
- 遵循项目 `.catch()` 风格（无需 try/catch）
- 导航到 `/tourist-planning/cities` 的 CTA 按钮保持不变

---

### Task 1: 扩展 CSS 变量桥接

**Files:**
- Modify: `src/layout/app.layout.tsx`
- Modify: `src/styles.css`

**Interfaces:**
- Produces: CSS 变量 `--color-on-surface-variant`, `--color-outline-variant`, `--color-primary-container`, `--color-surface`, `--color-tertiary`, `--color-tertiary-container`
- Produces: Tailwind `@utility` 类: `bg-color-surface`, `bg-color-primary-container`, `bg-color-tertiary-container`, `text-color-on-surface-variant`, `text-color-tertiary`, `border-color-outline-variant`

- [ ] **Step 1: 在 `app.layout.tsx` 补充 CSS 变量映射**

在 `AppLayout` 的 `style` 对象中添加新的 CSS 变量（与现有一致的位置）：

```tsx
// src/layout/app.layout.tsx — 在现有 style 对象中追加以下属性：
"--color-on-surface-variant": colors["on-surface-variant"],
"--color-outline-variant": colors["outline-variant"],
"--color-primary-container": colors["primary-container"],
"--color-surface": colors["surface"],
"--color-tertiary": colors["tertiary"],
"--color-tertiary-container": colors["tertiary-container"],
```

- [ ] **Step 2: 在 `styles.css` 补充 `@utility` 类**

在 `src/styles.css` 中追加新的 utility 定义（按现有分组归类）：

```css
/* bg utilities — 追加 */
@utility bg-color-surface {
  background-color: var(--color-surface);
}
@utility bg-color-primary-container {
  background-color: var(--color-primary-container);
}
@utility bg-color-tertiary-container {
  background-color: var(--color-tertiary-container);
}

/* text utilities — 追加 */
@utility text-color-on-surface-variant {
  color: var(--color-on-surface-variant);
}
@utility text-color-tertiary {
  color: var(--color-tertiary);
}

/* border utilities — 追加 */
@utility border-color-outline-variant {
  border-color: var(--color-outline-variant);
}
```

- [ ] **Step 3: 验证编译通过**

```bash
pnpm dev
# 确认 dev server 正常启动，无 CSS/TS 编译错误
```

- [ ] **Step 4: Commit**

```bash
git add src/layout/app.layout.tsx src/styles.css
git commit -m "feat: add CSS variable bridge for homepage redesign tokens"
```

---

### Task 2: SVG 路线动画组件

**Files:**
- Create: `src/pages/home/route-animation.tsx`

**Interfaces:**
- Produces: `RouteAnimation` 组件 — 无 props，纯展示型 SVG 动画
- Consumes: `useTheme().colors.primary`, `useTheme().colors.secondary`, `useTheme().colors.success`（通过 `useTheme()` hook）
- Consumes: CSS 类 `.route-path`, `.route-dot`, `.route-dot-glow`（来自 `index.module.css`）

- [ ] **Step 1: 创建 `route-animation.tsx`**

```tsx
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
```

- [ ] **Step 2: 更新 `index.module.css` 添加动画样式**

在现有 `.getting-started` 后追加动画相关样式：

```css
.route-path {
  stroke-dasharray: 600;
  stroke-dashoffset: 600;
}

.route-dot {
  opacity: 1;
}

.route-path-animate {
  animation: drawRoute 1.2s ease-out forwards;
}

@keyframes drawRoute {
  to {
    stroke-dashoffset: 0;
  }
}

.route-dot {
  opacity: 1;
}

.route-dot-animate {
  animation: dotPulse 0.4s ease-out forwards;
}

@keyframes dotPulse {
  0% {
    opacity: 0;
  }
  60% {
    opacity: 1;
  }
  100% {
    opacity: 1;
  }
}
```

- [ ] **Step 3: 验证组件渲染**

```bash
pnpm dev
# 打开浏览器，确认 SVG 在页面上渲染，路线可见
```

- [ ] **Step 4: Commit**

```bash
git add src/pages/home/route-animation.tsx src/pages/home/index.module.css
git commit -m "feat: add SVG route animation component for homepage hero"
```

---

### Task 3: 重写首页组件

**Files:**
- Modify: `src/pages/home/index.tsx`
- Modify: `src/pages/home/index.module.css`

**Interfaces:**
- Consumes: `RouteAnimation` from Task 2
- Consumes: `IconPsychology`, `IconBolt`, `IconSwapHoriz`, `IconExplore` from `musae/icons`
- Consumes: `Button`, `Grid` from `musae`
- Consumes: `useNavigate` from `@aiszlab/bee/router`
- Produces: 新的 `Home` 组件

- [ ] **Step 1: 重写 `index.module.css`**

用以下内容替换整个文件：

```css
.getting-started {
  background: linear-gradient(
    180deg,
    var(--color-surface) 0%,
    var(--color-primary-container) 100%
  );
}

.route-path {
  stroke-dasharray: 600;
  stroke-dashoffset: 600;
}

.route-dot {
  opacity: 1;
}

.route-path-animate {
  animation: drawRoute 1.2s ease-out forwards;
}

@keyframes drawRoute {
  to {
    stroke-dashoffset: 0;
  }
}

.route-dot-animate {
  animation: dotPulse 0.4s ease-out forwards;
}

@keyframes dotPulse {
  0% { opacity: 0; }
  60% { opacity: 1; }
  100% { opacity: 1; }
}
```

- [ ] **Step 2: 重写 `index.tsx`**

用以下内容替换整个文件：

```tsx
import { Button, Grid } from "musae";
import styles from "./index.module.css";
import { stringify } from "@aiszlab/relax/class-name";
import { IconBolt, IconExplore, IconPsychology, IconSwapHoriz } from "musae/icons";
import { useNavigate } from "@aiszlab/bee/router";
import RouteAnimation from "./route-animation";

const { Col, Row } = Grid;

const VALUE_CARDS = [
  {
    icon: IconPsychology,
    title: "个性规划",
    desc: "根据你的偏好，定制专属旅行路线",
    surfaceVar: "bg-color-surface-container-low" as const,
  },
  {
    icon: IconBolt,
    title: "省时省心",
    desc: "不再翻攻略做功课，AI 一键搞定",
    surfaceVar: "bg-color-surface-container-high" as const,
  },
  {
    icon: IconSwapHoriz,
    title: "随时调整",
    desc: "行程随时修改，新方案即刻生成",
    surfaceVar: "bg-color-surface-container-highest" as const,
  },
];

const STATS = [
  { value: "10+", label: "热门城市" },
  { value: "80+", label: "精选景点" },
  { value: "AI", label: "智能规划" },
];

const Home = () => {
  const navigate = useNavigate();

  const startTouristPlan = () => {
    navigate("/tourist-planning/cities");
  };

  const viewTouristPlans = () => {
    navigate("/tourist-plan/list");
  };

  return (
    <div className="flex flex-col gap-10 pb-4">
      {/* Hero */}
      <div className={stringify("px-6 pb-10 safe-pt-12", styles["getting-started"])}>
        {/* 路线动画 */}
        <div className="mb-4">
          <RouteAnimation />
        </div>

        {/* 标题区 */}
        <p className="text-color-on-surface-variant text-sm font-medium">
          AI 智能规划
        </p>
        <h1 className="text-color-on-surface text-3xl font-bold mt-2 leading-tight">
          发现世界之美
        </h1>
        <h2 className="text-color-on-surface text-3xl font-bold leading-tight">
          <span className="text-color-primary">智能规划</span>每段旅程
        </h2>
        <p className="text-color-on-surface-variant text-sm mt-2">
          选择城市 · 设定周期 · AI 自动生成专属路线
        </p>

        {/* CTA */}
        <Button className="mt-6 w-full" onClick={startTouristPlan}>
          开始规划我的旅行
        </Button>

        {/* 统计条 */}
        <div className="mt-10 backdrop-blur-xl bg-color-surface-container-high rounded-2xl border border-color-outline-variant flex justify-around py-3">
          {STATS.map(({ label, value }) => (
            <div key={label} className="flex flex-col items-center">
              <span className="text-lg text-color-primary font-bold">{value}</span>
              <span className="text-xs text-color-on-surface-variant">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* AI 为你做什么 */}
      <div className="px-4">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <IconExplore size={24} />
          AI 为你做什么
        </h2>

        <Row gutter={12} className="mt-4">
          {VALUE_CARDS.map((card) => (
            <Col span={card.title === "随时调整" ? 24 : 12} key={card.title}>
              <div
                className={`${card.surfaceVar} rounded-2xl p-4 border border-color-outline-variant`}
              >
                <div className="bg-color-primary-container rounded-xl w-10 h-10 flex items-center justify-center">
                  <card.icon size={22} color="var(--color-primary)" />
                </div>
                <h3 className="text-base font-medium mt-3">{card.title}</h3>
                <p className="text-sm text-color-on-surface-variant mt-1">{card.desc}</p>
              </div>
            </Col>
          ))}
        </Row>
      </div>

      {/* 底部 CTA */}
      <div className="px-4 flex flex-col gap-3">
        <Button onClick={startTouristPlan}>立刻开始规划</Button>
        <button
          className="text-color-on-surface-variant text-sm py-2"
          onClick={viewTouristPlans}
          type="button"
        >
          查看已有计划
        </button>
      </div>
    </div>
  );
};

export default Home;
```

- [ ] **Step 3: 验证页面渲染和导航**

```bash
pnpm dev
# 浏览器检查：
# 1. Homepage 渲染正常，路线动画播放
# 2. CTA 按钮点击跳转到 /tourist-planning/cities
# 3. "查看已有计划" 跳转到 /tourist-plan/list
# 4. 统计条、价值卡片、底部 CTA 完整显示
```

- [ ] **Step 4: 切换暗黑模式验证**

在 profile 页面切换暗黑模式开关，回到首页检查：
- 渐变背景正确切换
- 路线颜色、卡片底色正确切换
- 文字颜色可读

- [ ] **Step 5: 验证 reduced motion**

```bash
# 在浏览器 DevTools 中：
# 1. 打开 Rendering 面板
# 2. 勾选 "prefers-reduced-motion: reduce"
# 3. 刷新首页，确认路线直接完整显示，无自绘动画
```

- [ ] **Step 6: Commit**

```bash
git add src/pages/home/index.tsx src/pages/home/index.module.css
git commit -m "feat: redesign homepage with route animation and musae color tokens"
```

---

### Task 4: 最终验证

- [ ] **Step 1: 全量构建验证**

```bash
pnpm build
# 确认 web 构建成功，无 TS 错误、CSS 警告
```

- [ ] **Step 2: 视觉检查清单**

| 检查项 | 预期 |
|--------|------|
| Hero 渐变背景 | surface → primary-container |
| 路线动画 | 3 条路线顺序绘制，光点脉冲 |
| 暗黑模式路线 glow | 路线有微弱光晕 |
| 统计条 | 毛玻璃 + surface-container-high 底色 |
| 价值卡片 | 阶梯底色 (low/high/highest)，图标在 primary-container 圆角方块内 |
| 暗黑模式卡片 | 底色正确切换，文字可读 |
| 底部 CTA | 按钮可点击，文字链接可点击 |
| reduced motion | 动画跳过，路线直接显示 |
| safe-area | `safe-pt-12` 适配刘海屏 |

- [ ] **Step 3: Commit** (如有遗漏修复)

```bash
git add -A
git commit -m "chore: final verification and polish for homepage redesign"
```
