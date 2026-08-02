# 首页美化设计

## 目标

美化 H5 首页，营造"活力探索"品牌氛围，利用 musae M3 color token 实现完整的明暗主题支持。

**产品**: 驾驾旅游助手 — AI 旅行规划  
**受众**: 中国旅行者  
**页面目标**: 品牌优先，营造旅行探索的氛围感，让用户感受 AI 规划的独特价值  
**设计方向**: 路线动画 — 用 SVG 路径动画模拟旅行路线自动绘制，传达"AI 智能规划"产品心智

## 色彩系统

全部使用 musae Material 3 color token，零硬编码色值。

| 语义 | Token | 用途 |
|------|-------|------|
| 页面底色 | `surface` | 全局背景 |
| 路线主色 | `primary` | SVG 路线描边 |
| 路线 glow | `primary` + blur | 暗黑模式路线光晕 |
| 路线辅色 | `secondary` | 第二条路线 |
| 城市光点 | `primary` | SVG circle fill |
| 目的地标记 | `success` | 终点光点 |
| 统计条底色 | `surface-container-high` + backdrop-blur | Hero 统计条 |
| 卡片底色 | `surface-container-low` → `highest` | 价值卡片阶梯 |
| 主文字 | `on-surface` | 标题、正文 |
| 辅助文字 | `on-surface-variant` | 描述、标注 |
| 分割线 | `outline-variant` | 卡片边框 |

### 新增 CSS 变量映射

在 `app.layout.tsx` 中补充以下 token 到 CSS 变量：

- `--color-on-surface-variant`
- `--color-outline-variant`
- `--color-primary-container`
- `--color-surface`
- `--color-tertiary`
- `--color-tertiary-container`

同时在 `styles.css` 补充对应的 `@utility` 类。

## 字体

系统中文字体族，通过字号和粗细建立层级：

- **Hero 标题**: `text-3xl` (30px) + `font-bold` (700)
- **Hero 副标题**: `text-xl` (20px) + `font-medium` (500)
- **区块标题**: `text-2xl` (24px) + `font-semibold` (600)
- **卡片标题**: `text-base` (16px) + `font-medium` (500)
- **描述文字**: `text-sm` (14px) + 使用 `on-surface-variant`
- **辅助文字**: `text-xs` (12px)

## 页面结构

```
┌──────────────────────────────────┐
│           Hero 区域               │
│  ┌────────────────────────┐      │
│  │   SVG 路线动画层        │      │
│  │  3 条贝塞尔曲线自绘     │      │
│  │  5 个城市光点脉冲       │      │
│  └────────────────────────┘      │
│  旅行规划助手 + AI 智能规划       │
│  "发现世界之美"                   │
│  "智能规划每段旅程"               │
│  [开始规划我的旅行]  CTA          │
│  ┌─ 热门城市 ─┬─ 精选景点 ─┬─ AI ┐│
│  │   10+     │   80+     │ 智能││
│  └───────────┴───────────┴─────┘│
├──────────────────────────────────┤
│        AI 为你做什么              │
│  ┌──────────┐ ┌──────────────┐  │
│  │ 🎯       │ │ ⚡          │  │
│  │ 个性规划  │ │ 省时省心    │  │
│  │ ...      │ │ ...        │  │
│  └──────────┘ └──────────────┘  │
│  ┌──────────────────────────┐    │
│  │ 🔄                      │    │
│  │ 随时调整                │    │
│  │ ...                    │    │
│  └──────────────────────────┘    │
├──────────────────────────────────┤
│       [立刻开始规划]  CTA         │
│       查看已有计划               │
└──────────────────────────────────┘
```

## 签名元素：路线自绘动画

### 技术方案

- 纯 SVG `<path>` + CSS animation
- 3 条贝塞尔曲线，`stroke-dasharray` + `stroke-dashoffset` 实现自绘效果
- 每条路径端点各一个 `<circle>`，终点有脉冲动画
- 小程序/快应用不需要动画库，零依赖

### 动画时序

| 元素 | 开始 | 时长 | 效果 |
|------|------|------|------|
| 路线 1 | 0s | 1.2s | 自绘 + 起点光点立即亮 |
| 路线 1 终点 | 1.2s | 0.4s | scale 0→1.3→1，bounce |
| 路线 2 | 0.4s | 1.0s | 自绘 + 起点光点立即亮 |
| 路线 2 终点 | 1.4s | 0.4s | scale 0→1.3→1，bounce |
| 路线 3 | 0.8s | 1.0s | 自绘 + 起点光点立即亮 |
| 路线 3 终点 | 1.8s | 0.4s | scale 0→1.3→1，bounce |
| 总计 | — | ~2.2s | 全部完成 |

### 暗黑模式增强

暗黑模式下路线添加 `filter: drop-shadow(0 0 6px var(--color-primary))` 营造霓虹路线效果。光点光圈更大、更柔和。

### 无障碍

`@media (prefers-reduced-motion: reduce)` 时跳过动画，直接渲染完整路线。

## 价值卡片（替换原"如何使用"）

将原来的 4 步流程卡片改为 3 张 AI 价值卡片，更契合品牌优先定位：

1. **个性规划** — "根据你的偏好，定制专属路线" — 图标: `IconPsychology`
2. **省时省心** — "不用翻攻略，AI 一键搞定" — 图标: `IconAutoAwesome`
3. **随时调整** — "行程随时改，方案即刻出" — 图标: `IconCycle`

卡片使用 `surface-container-low` / `surface-container-high` / `surface-container-highest` 做阶梯底色，替代原来的硬编码颜色。

## 文件变更清单

| 文件 | 变更 |
|------|------|
| `src/pages/home/index.tsx` | 重写页面结构和内容 |
| `src/pages/home/index.module.css` | 重写动画样式 |
| `src/pages/home/route-animation.tsx` | **新增** SVG 路线动画组件 |
| `src/layout/app.layout.tsx` | 补充 CSS 变量映射 |
| `src/styles.css` | 补充 `@utility` 类 |
