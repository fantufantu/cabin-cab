# 版本升级检测 & 阻断提示

**日期**: 2026-08-09  
**状态**: 待评审

## 概述

在每次 GraphQL API 调用前，查询 iTunes App Store 获取最新版本号，与本地版本比较。如果 App Store 版本 > 本地版本，阻断页面并弹窗提示用户前往 App Store 升级。

## 动机

- 确保用户使用最新版本，避免已修复的 bug 或已下线 API 影响体验
- 纯客户端方案，不依赖后端配合
- 阻断式提示（不可关闭），确保升级率

## 架构

```
每次 GraphQL 请求
    │
    ▼
┌─────────────────────────────┐
│  VersionCheckLink (新增)     │  ← Apollo Link 链第一环
│  fetch iTunes Lookup API    │
│  比较 App Store vs 本地版本  │
│  ├─ 版本最新 → 放行         │
│  └─ 需要升级 → 中断请求      │
│               → store.outdated = true
└─────────────────────────────┘
    │ (放行)
    ▼
  SetContextLink → ErrorLink → HttpLink
    │
    ▼
  正常 GraphQL 请求

阻断状态触发
    │
    ▼
┌─────────────────────────────┐
│  Application                │
│  versionStore.outdated      │
│  → <UpgradeDialog />       │
│  → closable=false           │
│  → "去升级" → App Store     │
└─────────────────────────────┘
```

## 组件设计

### 1. Version Store — `src/stores/version.store.ts` (新增)

```typescript
// 状态
outdated: boolean           // 是否需要升级
appStoreVersion: string     // App Store 最新版本号
checking: boolean           // 是否正在检查中

// 方法
checkVersion(): Promise<void>  // 调用 iTunes API 并比较版本
```

- `outdated` 为 `true` 时触发阻断弹窗
- 版本比较结果缓存在 store 中，`checking` 防止并发重复请求

### 2. 版本查询 API — `src/api/version.api.ts` (新增)

```
GET https://itunes.apple.com/lookup?bundleId=com.fantufantu.cabin-cab
```

- 响应格式：`{ resultCount, results: [{ version }] }`
- 使用 `fetch()` 原生调用（不走 Apollo，避免循环依赖）
- 失败时返回 `null`，不阻断（降级策略）

### 3. VersionCheckLink — `src/api/index.ts` 改动

插入 Apollo Link 链的最前端：

```typescript
// 伪代码
new ApolloLink((operation, forward) => {
  if (import.meta.env.DEV) return forward(operation);  // 开发环境跳过
  if (versionStore.outdated) return;                     // 已过期，阻断请求
  
  return from(
    versionStore.checkVersion().then(() => {
      if (versionStore.outdated) throw new Error("version outdated");
      return forward(operation);
    })
  );
})
```

### 4. UpgradeDialog — `src/components/upgrade-dialog.tsx` (新增)

- 使用 musae `Dialog` 组件
- `open`: 绑定 `versionStore.outdated`
- `closable`: `false`（不可点击遮罩或 ESC 关闭）
- `title`: "发现新版本"
- `children`: 显示当前版本 vs App Store 版本，引导文案
- `onConfirm`: `window.open(appStoreUrl)` 跳转 App Store
- `confirm`: `{ children: "前往升级" }`
- `cancel`: `false`（不显示取消按钮）

### 5. Application 集成 — `src/application.tsx` 改动

在 `AppLayout` 外侧渲染 `UpgradeDialog`：

```tsx
<ConfigProvider locale={zh_CN}>
  <ThemeProvider defaultMode={mode}>
    <ApolloProvider client={client}>
      <AppLayout>{children}</AppLayout>
      <UpgradeDialog />  {/* 新增 */}
    </ApolloProvider>
  </ThemeProvider>
</ConfigProvider>
```

由于 `UpgradeDialog` 内部通过 `Dialog`（Portal）渲染，不依赖 DOM 位置，放在 `ApolloProvider` 内外均可。

## 版本比较逻辑

使用 semver 风格比较（`1.2.3` 格式）：

1. 将版本号按 `.` 拆分为 `[major, minor, patch]`
2. 从左到右逐位比较
3. App Store 版本任一位大于本地版本即视为需要升级

```typescript
// 伪代码
const isNewer = (remote: string, local: string): boolean => {
  const r = remote.split(".").map(Number);
  const l = local.split(".").map(Number);
  for (let i = 0; i < Math.max(r.length, l.length); i++) {
    if ((r[i] || 0) > (l[i] || 0)) return true;
    if ((r[i] || 0) < (l[i] || 0)) return false;
  }
  return false;
};
```

## 本地版本号获取

通过 Vite `define` 在构建时注入 `import.meta.env.VITE_APP_VERSION`：

```typescript
// vite.config.mts
define: {
  "import.meta.env.VITE_APP_VERSION": JSON.stringify(pkg.version),
}
```

## 开发环境处理

- `import.meta.env.DEV` 时 `VersionCheckLink` 直接放行，不查询 iTunes
- iTunes lookup API 仅在生产环境触发

## 降级策略

| 场景 | 行为 |
|------|------|
| iTunes API 网络超时 | `.catch(() => null)`，放行请求 |
| iTunes API 返回空结果 | 放行请求 |
| 版本号解析失败 | 放行请求 |
| 已在阻断状态 | 不再发起 iTunes 请求，直接拦截 |

## 实现备注

- Apollo Link 实际使用 RxJS `Observable` 模式，需要 `Observable.from()` 包装异步操作，非简单 async/await。细节在 plan 阶段展开。
- 项目构建使用 `@aiszlab/wasp`（Vite 封装），`define` 配置需确认透传方式。
- `Dialog` 组件放在 `ApolloProvider` 内部还是外部均可（Portal 渲染），最终位置在 plan 阶段确定。

## 风险 & 待定

| 项目 | 说明 |
|------|------|
| macOS 桌面端 | iTunes Lookup API 基于 iOS bundleId，macOS Tauri 桌面版无法查询。当前设计在桌面端会降级跳过 |
| iTunes CDN 延迟 | 新版本发布后 CDN 缓存可能几小时才更新，不会立即触发阻断 |
| 每次请求都调 iTunes | 可能有速率限制，后续可优化为缓存（如 5 分钟内复用结果） |
