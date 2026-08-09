# 版本升级检测 & 阻断提示 — 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 每次 GraphQL 请求前查询 iTunes App Store 版本，发现新版本时阻断页面并弹窗引导升级。

**Architecture:** Apollo Link 链最前端插入 VersionCheckLink → 每次请求前调 iTunes Lookup API 比较版本 → 需要升级时设置 store 状态并中断请求 → Application 层渲染不可关闭的 Dialog 阻断页面。

**Tech Stack:** React 19, TypeScript, Apollo Client v4 (RxJS Observable), musae Dialog, `@aiszlab/relax` (`using()` store), Vite `define`

## Global Constraints

- 开发环境 (`import.meta.env.DEV`) 跳过版本检查
- iTunes API 失败时降级放行，不阻断正常使用
- 版本比较使用逐位 semver 比较
- Dialog `closable=false`，不可 ESC 或点击遮罩关闭
- bundleId: `com.fantufantu.cabin-cab`

---

### Task 1: 构建时注入版本号

**Files:**
- Modify: `vite.config.mts`

**Interfaces:**
- Produces: `import.meta.env.VITE_APP_VERSION` → `string`（如 `"1.1.1"`）

- [ ] **Step 1: 修改 vite.config.mts 注入版本号**

读取 `package.json` 的 `version` 字段，通过 Vite `define` 注入为环境变量：

```typescript
import { defineConfig } from "@aiszlab/wasp/vite";
import pkg from "./package.json";

export default defineConfig({
  define: {
    "import.meta.env.VITE_APP_VERSION": JSON.stringify(pkg.version),
  },
});
```

- [ ] **Step 2: 验证版本号可访问**

在 `src/application.tsx` 中临时添加 `console.log(import.meta.env.VITE_APP_VERSION)`，启动 `pnpm dev` 确认控制台输出 `1.1.1`，然后删除临时代码。

- [ ] **Step 3: Commit**

```bash
git add vite.config.mts
git commit -m "feat: inject app version via Vite define
Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 2: 版本常量

**Files:**
- Create: `src/constants/version.constant.ts`

**Interfaces:**
- Produces:
  - `ITUNES_LOOKUP_URL` — `"https://itunes.apple.com/lookup?bundleId=com.fantufantu.cabin-cab"`
  - `APP_STORE_URL` — `"https://apps.apple.com/app/idYOUR_APP_ID"`（占位，后续替换真实 ID）
  - `LOCAL_VERSION` — `import.meta.env.VITE_APP_VERSION`

- [ ] **Step 1: 创建常量文件**

```typescript
/**
 * 版本检测相关常量
 */

/** iTunes Lookup API 地址 */
export const ITUNES_LOOKUP_URL =
  "https://itunes.apple.com/lookup?bundleId=com.fantufantu.cabin-cab";

/** App Store 应用页面（升级跳转），待替换为真实 Apple ID */
export const APP_STORE_URL = "https://apps.apple.com/app/idYOUR_APP_ID";

/** 本地应用版本号 */
export const LOCAL_VERSION: string = import.meta.env.VITE_APP_VERSION;
```

- [ ] **Step 2: Commit**

```bash
git add src/constants/version.constant.ts
git commit -m "feat: add version check constants
Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 3: Version Store

**Files:**
- Create: `src/stores/version.store.ts`

**Interfaces:**
- Consumes: `ITUNES_LOOKUP_URL`, `LOCAL_VERSION` from `src/constants/version.constant.ts`
- Produces:
  - `useVersionStore()` — hook + `useVersionStore.state` 静态访问
  - `state.outdated: boolean` — 是否需要升级
  - `state.appStoreVersion: string | null` — App Store 最新版本号
  - `state.checking: boolean` — 是否正在检查中（防并发）
  - `state.checkVersion(): Promise<void>` — 查询 iTunes 并比较版本

- [ ] **Step 1: 创建 version store**

```typescript
import { using } from "@aiszlab/relax/react";
import { ITUNES_LOOKUP_URL, LOCAL_VERSION } from "../constants/version.constant";

interface VersionStore {
  /** 是否需要升级 */
  outdated: boolean;
  /** App Store 最新版本号 */
  appStoreVersion: string | null;
  /** 是否正在检查中 */
  checking: boolean;
  /** 查询 iTunes 并比较版本 */
  checkVersion: () => Promise<void>;
}

/**
 * 版本检测 store
 *
 * 调用 iTunes Lookup API 获取 App Store 最新版本号，
 * 与本地版本比较，判断是否需要升级。
 */
const useVersionStore = using<VersionStore>((setState, getState) => {
  return {
    outdated: false,
    appStoreVersion: null,
    checking: false,

    checkVersion: async () => {
      // 防止并发重复请求
      const state = getState();
      if (state.checking || state.outdated) return;

      setState((prev) => ({ ...prev, checking: true }));

      const result = await fetch(ITUNES_LOOKUP_URL)
        .then(
          (res) =>
            res.json() as Promise<{ resultCount: number; results?: { version: string }[] }>,
        )
        .catch(() => null);

      if (!result || result.resultCount === 0 || !result.results?.[0]?.version) {
        setState((prev) => ({ ...prev, checking: false }));
        return;
      }

      const remoteVersion = result.results[0].version;
      const isOutdated = isNewerVersion(remoteVersion, LOCAL_VERSION);

      setState((prev) => ({
        ...prev,
        checking: false,
        appStoreVersion: remoteVersion,
        outdated: isOutdated,
      }));
    },
  };
});

/**
 * 比较两个 semver 版本号，remote > local 返回 true
 */
const isNewerVersion = (remote: string, local: string): boolean => {
  const r = remote.split(".").map(Number);
  const l = local.split(".").map(Number);
  const len = Math.max(r.length, l.length);

  for (let i = 0; i < len; i++) {
    const rv = r[i] || 0;
    const lv = l[i] || 0;
    if (rv > lv) return true;
    if (rv < lv) return false;
  }

  return false;
};

export { useVersionStore };
```

- [ ] **Step 2: Commit**

```bash
git add src/stores/version.store.ts
git commit -m "feat: add version store with iTunes check
Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 4: VersionCheckLink — Apollo Link 拦截

**Files:**
- Modify: `src/api/index.ts`

**Interfaces:**
- Consumes: `useVersionStore` from `src/stores/version.store.ts`
- Produces: 一个新的 `ApolloLink` 实例插入 link 链最前端

- [ ] **Step 1: 在 api/index.ts 中添加 VersionCheckLink**

在现有的 `ApolloLink.from([...])` 数组**最前面**插入一个新 link：

```typescript
import { ApolloClient, InMemoryCache } from "@apollo/client";
import { ErrorLink } from "@apollo/client/link/error";
import { HttpLink, ApolloLink } from "@apollo/client";
import { AUTH_TOKENS, GRAPHQL_URL } from "../constants/api.constant";
import { SetContextLink } from "@apollo/client/link/context";
import { tryAuthenticate } from "../utils/auth.utils";
import { Observable } from "@apollo/client/utilities";
import { useVersionStore } from "../stores/version.store";

const versionCheckLink = new ApolloLink((operation, forward) => {
  // 开发环境跳过版本检查
  if (import.meta.env.DEV) return forward(operation);

  const { outdated, checkVersion } = useVersionStore.state;

  return new Observable((observer) => {
    checkVersion()
      .then(() => {
        const { outdated: isOutdated } = useVersionStore.state;

        if (isOutdated) {
          // 版本过期，中断请求
          observer.complete();
          return;
        }

        // 放行到下一个 link
        forward(operation).subscribe({
          next: (result) => observer.next(result),
          error: (err) => observer.error(err),
          complete: () => observer.complete(),
        });
      })
      .catch(() => {
        // iTunes 查询失败，降级放行
        forward(operation).subscribe({
          next: (result) => observer.next(result),
          error: (err) => observer.error(err),
          complete: () => observer.complete(),
        });
      });
  });
});

const client = new ApolloClient({
  defaultOptions: {
    query: {
      fetchPolicy: "no-cache",
    },
  },
  cache: new InMemoryCache({}),
  link: ApolloLink.from([
    versionCheckLink,  // ← 最前端
    new SetContextLink(async (prevContext) => {
      // ... 保持不变
    }),
    new ErrorLink(({ error }) => {
      // ... 保持不变
    }),
    new HttpLink({
      uri: GRAPHQL_URL,
    }),
  ]),
});

export { client };
```

注意：`SetContextLink`、`ErrorLink`、`HttpLink` 的现有代码保持不动，仅在他们之前插入 `versionCheckLink`。

- [ ] **Step 2: 验证导入和构建**

运行 `pnpm build` 确认没有编译错误。

- [ ] **Step 3: Commit**

```bash
git add src/api/index.ts
git commit -m "feat: add VersionCheckLink to Apollo link chain
Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 5: UpgradeDialog 阻断弹窗

**Files:**
- Create: `src/components/upgrade-dialog.tsx`

**Interfaces:**
- Consumes: `useVersionStore` from `src/stores/version.store.ts`; `Dialog` from `musae`; `APP_STORE_URL` from `src/constants/version.constant.ts`
- Produces: `<UpgradeDialog />` 组件

- [ ] **Step 1: 创建 UpgradeDialog 组件**

```typescript
import { Dialog } from "musae";
import { useVersionStore } from "../stores/version.store";
import { APP_STORE_URL, LOCAL_VERSION } from "../constants/version.constant";

const UpgradeDialog = () => {
  const { outdated, appStoreVersion } = useVersionStore();

  const handleUpgrade = () => {
    window.open(APP_STORE_URL, "_blank");
  };

  return (
    <Dialog
      open={outdated}
      closable={false}
      title="发现新版本"
      onConfirm={handleUpgrade}
      confirm={{ children: "前往升级" }}
      cancel={false}
    >
      <div>
        <p>当前版本：{LOCAL_VERSION}</p>
        <p>最新版本：{appStoreVersion}</p>
        <p>请升级到最新版本以继续使用。</p>
      </div>
    </Dialog>
  );
};

export default UpgradeDialog;
```

- [ ] **Step 2: Commit**

```bash
git add src/components/upgrade-dialog.tsx
git commit -m "feat: add UpgradeDialog component
Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 6: Application 集成

**Files:**
- Modify: `src/application.tsx`

**Interfaces:**
- Consumes: `UpgradeDialog` from `src/components/upgrade-dialog.tsx`

- [ ] **Step 1: 在 Application 中渲染 UpgradeDialog**

在 `AppLayout` 之后（或之前）添加 `<UpgradeDialog />`。由于 musae `Dialog` 通过 Portal 渲染，DOM 位置不影响展示：

```typescript
import { type ApplicationProps } from "@aiszlab/bee";
import AppLayout from "./layout/app.layout";
import { ConfigProvider, ThemeProvider } from "musae";
import { zh_CN } from "musae/locales";
import { ApolloProvider } from "@apollo/client/react";
import { client } from "./api";
import { useMount, useRequest } from "@aiszlab/relax";
import { useAuthStore } from "./stores/auth.store";
import { useThemeStore } from "./stores/theme.store";
import UpgradeDialog from "./components/upgrade-dialog";

const Application = ({ children }: ApplicationProps) => {
  const { whoAmI } = useAuthStore();
  const { mode, init } = useThemeStore();

  useRequest(whoAmI, { auto: true });

  useMount(() => {
    init();
  });

  if (!mode) {
    return null;
  }

  return (
    <ConfigProvider locale={zh_CN}>
      <ThemeProvider defaultMode={mode}>
        <ApolloProvider client={client}>
          <AppLayout>{children}</AppLayout>
          <UpgradeDialog />
        </ApolloProvider>
      </ThemeProvider>
    </ConfigProvider>
  );
};

export default Application;
```

改动仅为：新增 `import UpgradeDialog` 一行，以及在 `<AppLayout>` 之后添加 `<UpgradeDialog />` 一行。

- [ ] **Step 2: 验证完整流程**

```bash
pnpm build
```

确认构建通过，无类型错误。

- [ ] **Step 3: Commit**

```bash
git add src/application.tsx
git commit -m "feat: integrate UpgradeDialog into Application
Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### 实现顺序

```
Task 1 (注入版本号) → Task 2 (常量) → Task 3 (Store) → Task 4 (Link) → Task 5 (Dialog) → Task 6 (集成)
```

Task 1-2 可并行，Task 3 依赖 Task 2，Task 4 依赖 Task 3，Task 5 依赖 Task 3，Task 6 依赖 Task 4 和 Task 5。
