# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Web dev server (port 9527)
pnpm dev

# Web production build → dist/
pnpm build

# Tauri desktop app (macOS)
pnpm dev:tauri

# iOS simulator
pnpm dev:ios        # iPhone 14 Plus
pnpm dev:ipad       # iPad Pro 13-inch

# iOS App Store build
pnpm build:ios

# Initialize iOS project (first time)
pnpm init:ios
```

Package manager is **pnpm** (see `pnpm-workspace.yaml`). The `.npmrc` points to npmmirror registry.

## Code Style

**Prefer `.catch()` over `try/catch`** for Promise error handling. Use the chainable `.catch(() => fallback)` pattern instead of wrapping `await` in `try/catch` blocks:

```typescript
// ✅ Good — chain .catch()
const user = await whoAmI().catch(() => null);
const data = await client.query({ query: TOURIST_PLAN }).catch(() => null);

// ❌ Avoid — try/catch for simple fallback
try {
  const user = await whoAmI();
} catch {
  // ...
}
```

`try/catch` is acceptable only when different error types need distinct handling, or when cleanup logic must run regardless of success/failure.

**Prefer `reduce` over `for...of`** for grouping/aggregation of array values into a `Map` or object:

```typescript
// ✅ Good — reduce
const grouped = items.reduce((map, item) => {
  (map.get(item.key) ?? []).push(item);
  return map;
}, new Map());

// ❌ Avoid — for...of
const grouped = new Map();
for (const item of items) {
  (grouped.get(item.key) ?? []).push(item);
}
```

## Architecture

Cabin Cab (驾驾旅游助手) is an AI-powered travel planning app built as a **Tauri v2** hybrid app targeting iOS and macOS desktop. The web frontend is a React 19 SPA that also runs in a Tauri WebView.

### Tech Stack

| Concern | Library |
|---------|---------|
| Build tool | `@aiszlab/wasp` (Vite wrapper) |
| App shell + routing | `@aiszlab/bee` |
| State management | `@aiszlab/relax` (`using()` stores + React hooks) |
| UI components | `musae` (Material-like, with `ConfigProvider` for theming/i18n) |
| CSS | Tailwind CSS v4 via `@aiszlab/wasp/tailwindcss` |
| API layer | Apollo Client (GraphQL) + SSE for streaming proposals |
| Desktop/iOS shell | Tauri v2 (Rust) |

### Internal Ecosystem

This project depends on a suite of `@aiszlab/*` packages that form a proprietary React framework:
- **`@aiszlab/bee`** — `bootstrap()`, routing (`useNavigate`, `useParams`, `Outlet`), and Vite config
- **`@aiszlab/relax`** — reactive stores (`using()`), hooks (`useRequest`, `useCounter`, `useEvent`, `useAsyncEffect`, `useInfiniteScroll`, `useSessionStorageState`), and utilities (`toArray`, `isUndefined`, `stringify`/class-name, `tryParse`, `clipboard`)
- **`@aiszlab/wasp`** — build tooling and Tailwind preset
- **`musae`** — UI component library with `ConfigProvider` (locale), theming via `useTheme()`, and components like `Button`, `Tabs`, `Calendar`, `Tag`, `Search`, `RichTextEditor`, `Skeleton`, `Notification`, `Message`

### Application Bootstrap

`src/main.tsx` → `bootstrap()` → `src/application.tsx` → providers:

1. **`Application`** (`src/application.tsx`) wraps the app in:
   - `ConfigProvider` (musae, locale=`zh_CN`) — theming + i18n
   - `ApolloProvider` (client from `src/api/index.ts`)
   - `Layout` (injects Material 3 CSS custom properties via `useTheme().colors`)
2. On mount, `useRequest(whoAmI, { auto: true })` fires to restore the user session from the stored token.
3. All routes use `React.lazy()` for code-splitting.

### Route Design

Routes are declared in `src/main.tsx` via `bootstrap()`:

| Path | Page | Purpose |
|------|------|---------|
| `/` | Home | Landing with CTA to start planning |
| `/login` | Login | Email + password auth |
| `/tourist-plan/list` | List | User's saved plans |
| `/tourist-plan/cities` | Step 1 | City selection (multi-select grid) |
| `/tourist-plan/period` | Step 2 | Travel duration + departure date |
| `/tourist-plan/attractions` | Step 3 | Attraction selection per city |
| `/tourist-plan/:id` | Detail | AI-generated itinerary with SSE streaming |

Steps 1–3 share a `TouristPlanLayout` component (declared with `Component` not `element` — the `@aiszlab/bee` convention for layout routes) that wraps children in `PlanContext.Provider`, managing the multi-step wizard state (selected city codes, duration, departure date). State is persisted to `sessionStorage` and cleared on unmount.

### Auth Flow

1. **Login**: `auth.store.login()` → `login()` mutation (returns token) → stored in `localStorage` as `"authentication"` → `whoAmI()` query → `me` state set.
2. **Session restore**: `Application` calls `whoAmI()` on mount → reads stored token via `tryAuthenticate()` → if token exists, Apollo's `SetContextLink` injects `Authorization: Bearer <token>` header.
3. **Apollo auth link** (`src/api/index.ts`): reads `localStorage` key `"authentication"`, sets `authorization` header. Caches the header per-request context to avoid repeated localStorage reads.

### API Layer (`src/api/`)

- **`index.ts`** — Apollo Client setup with:
  - `SetContextLink` — injects `Authorization: Bearer <token>` from `localStorage`
  - `ErrorLink` — shows `musae` `Notification` on GraphQL errors
  - `HttpLink` — points to `https://api.fantufantu.com/graphql`
  - Default fetch policy is `no-cache`
- **`auth.api.ts`** — Login mutation, `whoAmI` query
- **`tourist-plan.api.ts`** — CRUD for plans + `listenTouristPlanProposal()` which uses `EventSource` (SSE) to stream AI-generated markdown proposals
- **`attraction.api.ts`** / **`city.api.ts`** — Paginated GraphQL queries with client-side caching in `amap.store`

### State Management (`src/stores/`)

Stores use `@aiszlab/relax`'s `using()` pattern (similar to Zustand):
- **`auth.store.ts`** — `me` (current user), `login()`, `whoAmI()`; token persisted to `localStorage`
- **`app.store.ts`** — Generates/persists a unique `appId` (UUID) via Tauri's `LazyStore` (falls back gracefully); used to scope plans to a device
- **`amap.store.ts`** — City and attraction caches using `Map`; avoids redundant API calls

### Tauri (`src-tauri/`)

- **`lib.rs`** — App builder with `tauri-plugin-log` enabled in debug
- **`main.rs`** — Entry point (Windows console suppression)
- **`tauri.conf.json`** — iOS-focused config (identifier: `com.fantufantu.cabin-cab`, dev team `8959G6UR72`); WebView dev URL at `http://localhost:9527`
- **`capabilities/default.json`** — Permissions: `core:default`
- The `gen/apple/` directory contains the Xcode project and iOS build artifacts

### Platform Detection

`src/utils/tauri.util.ts` provides:
- **`isTauri()`** — checks `window.isTauri` to detect if running inside Tauri WebView vs. browser.
- **`LOCAL_STORAGE`** — a `LazyStore` instance (`@tauri-apps/plugin-store`) that persists to `./cabin-cab.store.json`. Used for device-scoped data like `appId`. Falls back gracefully outside Tauri.

### Theme & Styling

CSS custom properties are defined in `src/layout/index.tsx` via `musae`'s `useTheme().colors`, mapping Material 3 color tokens (surface, primary, secondary, outline, success) to `--color-*` variables. Tailwind utilities in `src/styles.css` expose these as `bg-color-*`, `text-color-*`, and `border-color-*` utility classes.

- **Tailwind CSS v4** with `@utility` directives defined in `src/styles.css` for theme-aware color utilities.
- **CSS Modules** (`.module.css`) are used for component-specific styles alongside Tailwind utilities.
- **`safe-pt-*`** utility: Tailwind v4 custom utility for iOS safe-area top padding (e.g., `safe-pt-4` → `padding-top: max(16px, env(safe-area-inset-top))`).

### Environment

Sensitive config is in `.env.local` (git-ignored). API base URL is hardcoded in `src/constants/api.constant.ts` as `https://api.fantufantu.com`.
