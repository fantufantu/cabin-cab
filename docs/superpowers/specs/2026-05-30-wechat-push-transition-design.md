# Route Transition Animation — WeChat-Style Push (Revision)

**Date:** 2026-05-30
**Status:** Approved
**Supersedes:** 2026-05-30-route-transition-animation-design.md

---

## Motivation

The current transition uses `AnimatePresence mode="wait"` with opacity fades, creating a brief blank gap between pages that feels like a "blur" (虚化). Users expect a WeChat-style push navigation where the new page slides over the old one, and the old page stays fully visible underneath — no gap, no fade.

## Requirements

- **PUSH** (forward): new page slides in from right edge, old page stays in place underneath
- **POP** (back): current page slides out to right edge, revealing the old page underneath
- No opacity animation on either page — pure horizontal slide
- No shadow on the entering page
- `AnimatePresence mode="sync"` — both pages render simultaneously during transition
- Motion divs use absolute positioning (`absolute inset-0`) so pages stack correctly
- 0.3s duration, ease-out on enter / ease-in on exit (unchanged from previous)
- First page load does NOT animate (unchanged: `initial={false}`)
- `REPLACE` navigation type treated as PUSH (unchanged)

## Implementation

### Single file change: `src/components/page-transition/index.tsx`

Three changes from the current implementation:

**1. Mode: `"wait"` → `"sync"`**

**2. Variants: remove opacity, adjust exit behavior**

| Direction | initial   | animate | exit      |
|-----------|-----------|---------|-----------|
| PUSH      | x: "100%" | x: 0    | x: 0      |
| POP       | x: 0      | x: 0    | x: "100%" |

**3. Motion div: add absolute positioning**

Use Tailwind classes `absolute inset-0` on the `motion.div` so both pages occupy the same area. The entering page (later in DOM order) naturally stacks on top.

### Container styling

The page wrapper must have `relative` positioning to serve as the positioning anchor. This is already the case — the root layout provides a relative container.

### What stays the same

- `withPageTransition` utility — no changes
- `main.tsx` integration — no changes
- Key = `pathname` — unchanged
- `initial={false}` to skip first-load animation — unchanged
- Direction detection via `useNavigationType()` — unchanged

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| First app load | `initial={false}` skips animation |
| Same-pathname navigation | No animation — key unchanged |
| Direct URL / deep link | No exit animation, enter animation plays |
| `REPLACE` navigation | Treated as PUSH |
| Nested routes | Each route wrapper works independently |

## Testing

- Navigate forward through app flow — new page slides in from right, old page visible underneath with no fade
- Press back — current page slides out to right, reveals previous page
- First load — no fly-in animation
