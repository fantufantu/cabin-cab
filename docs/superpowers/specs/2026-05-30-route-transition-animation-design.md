# Route Transition Animation — Design Spec

**Date:** 2026-05-30
**Status:** Approved

---

## Overview

Add iOS-style push/pop slide animations to all route transitions. Currently route changes are instant and jarring; this gives the app a native-feeling navigation experience using `framer-motion`.

## Requirements

- All route transitions use a horizontal slide animation
- **PUSH** (forward navigation): new page slides in from the right, old page slides out to the left
- **POP** (back/return navigation): new page slides in from the left, old page slides out to the right
- `REPLACE` navigations use the PUSH direction
- First page load does NOT animate (no fly-in on app open)
- Animation: 0.3s duration, ease-out on enter, ease-in on exit
- Both position and opacity animated for a smooth blend

## Architecture

### New File

```
src/components/page-transition/index.tsx
```

Exports two things:
1. `<PageTransition>` — the animation wrapper component
2. `withPageTransition(routes)` — a utility that recursively wraps route `element` fields with `<PageTransition>`

### Modified File

```
src/main.tsx
```

Wrap the routes array with `withPageTransition()` before passing to `bootstrap()`.

### Component Tree Change

```
Before:
  bootstrap({ routes: [...] })
  → Each route element renders directly

After:
  bootstrap({ routes: withPageTransition([...]) })
  → Each route element is wrapped in <PageTransition>
  → <PageTransition> uses AnimatePresence + motion.div
```

## PageTransition Component

```
PageTransition
├── AnimatePresence (mode="wait", initial={false})
│   └── motion.div (key={pathname})
│       ├── variants: PUSH or POP (based on useNavigationType)
│       ├── initial: "initial"
│       ├── animate: "animate"
│       ├── exit: "exit"
│       └── {children}
```

### Animation Variants

| Direction | initial        | animate        | exit           |
|-----------|----------------|----------------|----------------|
| PUSH      | x: 30%, o: 0   | x: 0, o: 1     | x: -30%, o: 0  |
| POP       | x: -30%, o: 0  | x: 0, o: 1     | x: 30%, o: 0   |

- `x` displacement uses percentage to scale across screen widths
- `opacity` fade smooths the slide, avoiding a hard cut

### Transition Config

```ts
{
  x: { type: "tween", duration: 0.3, ease: ["easeOut", "easeIn"] },
  opacity: { duration: 0.3 },
}
```

The `ease` array maps to `[enter, exit]` frames.

### Key Selection

- Key = `useLocation().pathname`
- Only pathname changes trigger animations; query/hash changes do not (expected behavior)
- `AnimatePresence` uses this key to distinguish old vs new page

## withPageTransition Utility

Recursively processes a route config array:

- If a route has `element`, wrap it: `<PageTransition>{element}</PageTransition>`
- If a route has `children`, recurse into them
- Routes with only `Component` (layout shells) are left untouched — they are not pages

```ts
function withPageTransition(routes: RouteConfig[]): RouteConfig[] {
  return routes.map((route) => ({
    ...route,
    element: route.element ? <PageTransition>{route.element}</PageTransition> : route.element,
    children: route.children ? withPageTransition(route.children) : route.children,
  }));
}
```

## main.tsx Integration

Single-line change at the call site:

```tsx
bootstrap({
  selectors: "#root",
  render: Application,
  routes: withPageTransition([
    { path: "", element: <Home /> },
    { path: "login", element: <Login /> },
    // ... rest unchanged
  ]),
});
```

All route definitions stay as-is. Future routes added to the array are automatically animated.

## Dependencies

- **framer-motion** — already a transitive dependency via `musae`, no additional install needed
- **@aiszlab/bee/router** — re-exports `useLocation` and `useNavigationType` from `react-router` v7

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| First app load | `initial={false}` skips animation, page appears immediately |
| Same-pathname navigation (e.g., tab switch via query) | No animation — key unchanged |
| Direct URL access / deep link | No exit animation (no previous page), enter animation plays |
| `REPLACE` navigation type | Treated as PUSH direction |
| Nested route children (cities/period/attractions) | `withPageTransition` recurses, each gets its own wrapper |
| Layout shell routes (TouristPlanLayout) | Only has `Component`, no `element` — skipped by the utility |

## Error Handling

No runtime error cases. If `useNavigationType()` returns an unexpected value, the default falls through to PUSH direction. The component handles `undefined`/`null` children gracefully (renders nothing).

## Testing

- Manual verification: navigate through the full flow (home → cities → period → attractions → plan detail → list) and confirm each transition animates correctly
- Pop test: use back button / navigate backward and confirm reverse animation plays
- First load: cold-start the app and confirm no jarring fly-in
- Reduced motion: not in scope for this iteration (can be added later via `useReducedMotion()`)
