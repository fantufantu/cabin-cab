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

Prettier is configured in `package.json`: 2-space indent, semicolons, trailing commas, 100 char width, arrow parens always, double quotes.

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

**Use `musae` `Form` for all input-type forms.** Never manage form field state manually with `useState` when the page contains text inputs, selects, or other form controls. Use `Form.useForm<T>()` to create a typed form instance, wrap fields in `<Form.Item name="...">` with validation `rules`, and read values via `form.getFieldsValue()` on submit. Non-input UI state (e.g., checkbox agreement, loading flags) remains as `useState`.

**Prefer `reduce` over `for...of`** for grouping/aggregation of array values into a `Map` or object.

## Architecture

Cabin Cab (驾驾旅游助手) is an AI-powered travel planning app built as a **Tauri v2** hybrid app targeting iOS and macOS desktop. The web frontend is a React 19 SPA that also runs in a Tauri WebView.

### Tech Stack

| Concern | Library |
|---------|---------|
| Build tool | `@aiszlab/wasp` (Vite wrapper) |
| App shell + routing | `@aiszlab/bee` |
| State management | `@aiszlab/relax` (`using()` stores + React hooks) |
| UI components | `musae` (Material-like, with `ConfigProvider` for theming/i18n + `ThemeProvider` for dark/light mode) |
| Animation | `framer-motion` |
| CSS | Tailwind CSS v4 via `@aiszlab/wasp/tailwindcss` + CSS Modules |
| API layer | Apollo Client (GraphQL) + SSE (EventSource) for streaming AI proposals |
| Desktop/iOS shell | Tauri v2 (Rust) |

### Internal Ecosystem

This project depends on a suite of `@aiszlab/*` packages that form a proprietary React framework:
- **`@aiszlab/bee`** — `bootstrap()`, routing (`useNavigate`, `useParams`, `Outlet`, `NavLink`), and Vite config
- **`@aiszlab/relax`** — reactive stores (`using()`), hooks (`useRequest`, `useCounter`, `useEvent`, `useAsyncEffect`, `useInfiniteScroll`, `useSessionStorageState`, `useMount`, `useUnmount`), and utilities (`toArray`, `isUndefined`, `stringify`/class-name, `tryParse`, `clipboard`)
- **`@aiszlab/wasp`** — build tooling and Tailwind preset
- **`musae`** — UI component library with `ConfigProvider` (locale), `ThemeProvider` (dark/light mode), theming via `useTheme()` returning Material 3 color tokens, and components like `Button`, `Tabs`, `Calendar`, `Tag`, `Search`, `RichTextEditor`, `Skeleton`, `Notification`, `Message`, `Divider`, `IconButton`

### Application Bootstrap

`src/main.tsx` → `bootstrap()` → `src/application.tsx` → providers:

1. **`Application`** (`src/application.tsx`) wraps the app in:
   - `ConfigProvider` (musae, locale=`zh_CN`) — theming + i18n
   - `ThemeProvider` (musae, `defaultMode` from `useThemeStore`) — dark/light mode
   - `ApolloProvider` (client from `src/api/index.ts`)
   - `AppLayout` (injects Material 3 CSS custom properties via `useTheme().colors`)
2. On mount, `useRequest(whoAmI, { auto: true })` fires to restore the user session; `useMount(() => init())` restores the persisted theme mode.
3. If theme mode hasn't loaded yet, the app renders `null` (avoids flash of wrong theme).
4. All routes use `React.lazy()` for code-splitting.

### Route Design

Routes are declared in `src/main.tsx` via `bootstrap()` with nested layouts:

```
MainLayout (bottom tab bar: 首页/旅行/我的)
├── /                          → Home (landing page with CTA)
├── /profile                   → Profile (user info)
└── /tourist-plan/list         → Plan list (saved plans)

TouristPlanLayout (plan detail with tabs)
├── /tourist-plan/:id          → Proposal (AI-generated markdown, SSE streaming)
└── /tourist-plan/:id/itineraries → Itineraries (day-by-day schedule)

TouristPlanningLayout (wizard, PlanContext.Provider)
├── /tourist-planning/cities       → Step 1 (city multi-select grid)
├── /tourist-planning/period       → Step 2 (duration + departure date)
└── /tourist-planning/attractions  → Step 3 (attraction selection per city)

Standalone
└── /login                     → Login (email + password)
```

Layout routes use `Component` (not `element`) — the `@aiszlab/bee` convention for layout routes. `TouristPlanningLayout` manages wizard state via `PlanContext` and persists to `sessionStorage`; state is cleared on unmount via `useUnmount`.

### Layout Architecture (4 layers)

1. **`AppLayout`** (`src/layout/app.layout.tsx`) — Root wrapper. Injects Material 3 CSS custom properties (`--color-surface`, `--color-primary`, `--color-on-surface`, etc.) into the DOM via inline styles from `useTheme().colors`. All other layouts render inside this.

2. **`MainLayout`** (`src/layout/main.layout.tsx`) — Bottom tab bar navigation with 3 tabs (首页/旅行/我的). Uses `NavLink` from `@aiszlab/bee/router` with active-state styling. The nav bar is fixed at the bottom with safe-area padding.

3. **`TouristPlanLayout`** (`src/layout/tourist-plan.layout.tsx`) — Plan detail view. Fetches the plan by `:id`, sets up SSE streaming for AI proposal generation, provides `TouristPlanContext`. Has a sticky header with back button, share button, and plan summary. Contains a `Tabs` component switching between "计划内容" (proposal) and "行程详情" (itineraries). Footer has "重新规划" (regenerate) and share actions.

4. **`TouristPlanningLayout`** (`src/layout/tourist-planning.layout.tsx`) — Planning wizard. Provides `PlanContext` with period state (duration with `useCounter`, departure date) and city selection state (Set of city codes). Clears sessionStorage on unmount.

### Auth Flow

The auth system supports both logged-in users and guest mode:

1. **Login**: `auth.store.login()` → `login()` mutation → token stored in `localStorage` as `"authentication"` → `whoAmI()` called → `me` state set.
2. **Session restore**: `Application` calls `whoAmI()` on mount. If the API call succeeds, the user is authenticated. If it fails, a **guest user** is created with a device-scoped `appId` (UUID persisted via Tauri's `LazyStore` or browser `localStorage` fallback). Guest nickname is `游客` + last 6 chars of appId.
3. **Guest quota**: `GUEST_QUOTA = 3` plans per day. The count is fetched from `COUNT_TOURIST_PLANS_TODAY` query scoped to the device's `appId`.
4. **Apollo auth link** (`src/api/index.ts`): reads `localStorage` key `"authentication"` via `tryAuthenticate()`, sets `Authorization: Bearer <token>` header. Caches the header per-request context to avoid repeated localStorage reads.

### API Layer (`src/api/`)

- **`index.ts`** — Apollo Client setup: `SetContextLink` (auth header injection), `ErrorLink` (shows `musae` `Notification` on GraphQL errors), `HttpLink` (points to `https://api.fantufantu.com/graphql`). Default fetch policy is `no-cache`.
- **`auth.api.ts`** — Login mutation, `whoAmI` query
- **`tourist-plan.api.ts`** — CRUD for plans, `COUNT_TOURIST_PLANS_TODAY` query, `listenTouristPlanProposal()` which uses `EventSource` (SSE) to stream AI-generated markdown proposals, and `PARSE_TOURIST_PLAN` mutation
- **`tourist-plan-itinerary.api.ts`** — Itinerary CRUD operations
- **`attraction.api.ts`** / **`city.api.ts`** — Paginated GraphQL queries
- Each API module has a corresponding `.types.ts` file for TypeScript types

### State Management (`src/stores/`)

Stores use `@aiszlab/relax`'s `using()` pattern (similar to Zustand):
- **`auth.store.ts`** — `me` (current user or guest), `isLoggedIn`, `login()`, `whoAmI()`, `logout()`, `myId()` (returns user id or appId). Manages `appId` generation and persistence. Guest users are created when `whoAmI` fails — they get a device-scoped UUID with `游客` nickname.
- **`theme.store.ts`** — `mode` (dark/light), `init()` (restores persisted mode from Tauri `LazyStore`), `persist()` (saves mode to storage). Used by `Application` to set `ThemeProvider`'s `defaultMode`.
- **`event-bus.store.ts`** — Simple in-app pub/sub event bus. Currently has one event token: `REFRESH_TOURIST_PLANS`. Provides `on(event, handler)` → returns unsubscribe function, and `emit(event)`.

### React Contexts (`src/contexts/`)

- **`tourist-plan.context.ts`** — Provides `touristPlan` state and `setTouristPlan` setter to plan detail pages. Consumed via `useTouristPlanContext()`.
- **`tourist-planning.context.ts`** — Provides wizard state: `period` (duration, departure date, counter controls) and `cities` (selected city codes, toggle). Consumed via `usePlanContext()`.

### Tauri (`src-tauri/`)

- **`lib.rs`** — App builder with `tauri-plugin-log` enabled in debug
- **`main.rs`** — Entry point (Windows console suppression)
- **`tauri.conf.json`** — iOS-focused config (identifier: `com.fantufantu.cabin-cab`, dev team `8959G6UR72`); WebView dev URL at `http://localhost:9527`
- **`capabilities/default.json`** — Permissions: `core:default`
- The `gen/apple/` directory contains the Xcode project and iOS build artifacts

### Platform Detection & Storage (`src/utils/tauri.utils.ts`)

- **`isTauri()`** — checks `window.isTauri` to detect if running inside Tauri WebView vs. browser.
- **`LOCAL_STORAGE`** — In Tauri: a `LazyStore` instance (`@tauri-apps/plugin-store`) persisting to `./cabin-cab.store.json`. In browser: a `localStorage`-backed fallback with the same `get`/`set`/`save` interface.
- **`LOCAL_STORAGE_KEYS`** — `APP_ID` and `THEME_MODE` keys.
- **`GUEST_QUOTA`** — Default daily plan quota for guest users (3).
- **`auth.utils.ts`** — `tryAuthenticate()` reads the auth token from `localStorage`.
- **`reduced-motion.util.ts`** — `useReducedMotion()` hook respecting `prefers-reduced-motion` media query.

### Theme & Styling

CSS custom properties are defined in `src/layout/app.layout.tsx` via `musae`'s `useTheme().colors`, mapping Material 3 color tokens (surface, surface-container-low/high/highest, primary, on-primary, secondary, on-secondary, on-surface, on-surface-variant, outline-variant, primary-container, tertiary, tertiary-container, error, on-error, success) to `--color-*` variables. Tailwind utilities in `src/styles.css` expose these as `bg-color-*`, `text-color-*`, and `border-color-*` utility classes.

- **Tailwind CSS v4** with `@utility` directives defined in `src/styles.css` for theme-aware color utilities.
- **CSS Modules** (`.module.css`) are used for component-specific styles alongside Tailwind utilities.
- **`safe-pt-*`** utility: Tailwind v4 custom utility for iOS safe-area top padding (e.g., `safe-pt-4` → `padding-top: max(16px, env(safe-area-inset-top))`).
- Dark/light mode is managed by `ThemeProvider` from musae, with mode persisted to Tauri `LazyStore`.

### Environment

Sensitive config is in `.env.local` (git-ignored). API base URL is hardcoded in `src/constants/api.constant.ts` as `https://api.fantufantu.com`.
