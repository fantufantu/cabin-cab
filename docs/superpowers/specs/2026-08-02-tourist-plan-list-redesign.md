# 行程列表页面美化 & 左滑删除

## 概述

对行程列表页（`/tourist-plan/list`）进行视觉美化，采用"旅行手札"风格；新增左滑露出删除按钮的交互，配合 Popconfirm 二次确认完成删除。

## 视觉系统

### 配色

沿用 `AppLayout` 注入的 Material 3 CSS 自定义属性，调整使用方式：

| Token | 用途 |
|---|---|
| `--color-surface` | 页面背景 |
| `--color-surface-container-low` | 卡片背景 |
| `--color-surface-container-high` | 卡片按压态、左滑操作区背景 |
| `--color-primary` | 卡片左侧书签色带 |
| `--color-error` | 删除按钮背景 |
| `--color-on-error` | 删除按钮文字 |
| `--color-on-surface` | 主文字 |
| `--color-on-surface-variant` | 辅助文字（日期、景点数） |

### 字体层次

| 层级 | 元素 | 样式 |
|---|---|---|
| 标题 | `X天行程` | `text-lg font-semibold tracking-wide` |
| 日期 | `YYYY/MM/DD - YYYY/MM/DD` | `text-sm tabular-nums text-color-on-surface-variant` |
| 标签 | 城市 Tag 组件 | 保持 musae Tag，增加 primary-container 底色 |
| 辅助 | `X个景点` | `text-xs text-color-on-surface-variant` |

### 卡片结构

```
┌─────────────────────────────────────────┐
│ ┃  3天行程          2026/08/15 - 08/18  │
│ ┃                                       │
│ ┃  📍 杭州  📍 苏州  📍 上海           │
│ ┃                                       │
│ ┃  12个景点                             │
│ ┃                           [ 🗑 删除 ] │  ← 左滑露出
└─────────────────────────────────────────┘
  ↑ 4px primary 左边框色带
```

- 去掉 `border`，改用 `shadow-sm` + `bg-color-surface-container-low`
- 左侧 4px `primary` 色带（`border-l-4`，颜色使用 `--color-primary`）
- 圆角 `rounded-2xl`
- 卡片间距 `gap-4`
- 页面背景 `bg-color-surface`

### 动效

- **列表进入**：卡片从下方依次淡入（staggered fade-in，stagger 60ms）
- **左滑**：卡片跟随手指平移，松开后吸附到目标位置（spring 回弹 / snap）
- **删除**：卡片向右滑出 + 淡出（~300ms ease-in-out），下方卡片上移补位
- **prefers-reduced-motion**：移除滑动和淡入动画，直接显示/隐藏

## 左滑删除交互

### 手势行为

- **触发**：手指在卡片上向左滑动 > 20px，松开后自动吸附到露出位置（~80px）
- **回弹**：滑动不足 20px 或向右滑，卡片弹回原位
- **互斥**：同一时间只有一张卡片处于展开状态；点击其他区域自动收回
- **滚动收回**：页面滚动时自动收回已展开的卡片

### 删除操作区

- **宽度**：80px
- **内容**：`IconDelete` 垃圾桶图标 + "删除" 文字，垂直居中
- **颜色**：`bg-color-error` 背景，`text-color-on-error` 文字

### 删除确认

- 点击删除按钮后弹出 `Popconfirm`：
  - 文案：「确定删除此行程吗？删除后无法恢复。」
  - 确认按钮：`Button color="error"`「删除」
  - 取消按钮：`Button variant="outlined"`「取消」

### 删除流程

1. 确认后调用 `DELETE_TOURIST_PLAN` mutation
2. 删除按钮显示 loading，防止重复点击
3. 成功后卡片退出动画 → `Message.success`：「行程已删除」
4. 通过 event bus 触发 `REFRESH_TOURIST_PLANS` 刷新列表
5. 失败时由 Apollo ErrorLink 自动弹出 `Notification.error`

## API 层

### 新增 Mutation

在 `src/api/tourist-plan.api.ts` 中新增：

```typescript
export const DELETE_TOURIST_PLAN: TypedDocumentNode<
  { deleteTouristPlan: boolean },
  { id: string }
> = gql`
  mutation DeleteTouristPlan($id: String!) {
    deleteTouristPlan(id: $id)
  }
`;
```

## 组件结构

```
src/
├── components/
│   └── swipeable-card/
│       └── index.tsx          # 新增：通用左滑卡片组件
├── api/
│   └── tourist-plan.api.ts    # 修改：新增 DELETE_TOURIST_PLAN
└── pages/
    └── tourist-plan/
        └── list/
            └── index.tsx       # 修改：新卡片样式 + 左滑删除
```

### SwipeableCard 组件接口

```typescript
interface SwipeableCardProps {
  /** 点击删除按钮后的回调（含确认逻辑） */
  onDelete: () => void;
  /** 删除区文字，默认 "删除" */
  deleteLabel?: string;
  /** 删除区图标 */
  deleteIcon?: ReactNode;
  /** 卡片内容 */
  children: ReactNode;
  /** 卡片外层 className */
  className?: string;
}
```

### 数据流

```
左滑露出 → 点击删除按钮 → Popconfirm 确认
  → DELETE_TOURIST_PLAN mutation
    → 成功后 emit REFRESH_TOURIST_PLANS
      → 列表 useRequest 自动 re-fetch
```

## 边界情况

- **删除中**：删除按钮 loading，防重复点击
- **删除失败**：Apollo ErrorLink 自动 Notification.error
- **空列表**：删除最后一张卡片后，展示空状态（旅行插画风格）
- **减少动效**：`prefers-reduced-motion` 时跳过滑动/淡入动画
- **页面离开**：组件卸载时清理 touch 事件监听

## 空状态设计

新建一个空状态组件（或内联在列表页），包含：
- 旅行主题插画（可使用 musae `Empty` 组件或自定义 SVG）
- 主文案：「还没有出行计划」
- 副文案：「开启你的第一段旅程吧」
- CTA 按钮：「创建行程」→ 跳转到 `/tourist-plan/cities`
