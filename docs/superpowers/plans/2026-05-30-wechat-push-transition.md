# WeChat-Style Push Transition — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current "wait" mode route transition (which fades/blurs between pages) with a WeChat-style push transition where the new page slides over the old one.

**Architecture:** Single file change to `PageTransition` component. Switch `AnimatePresence` from `mode="wait"` to `mode="sync"`, wrap in a CSS grid container so both pages stack in the same cell during transition, remove opacity from variants, and adjust translateX values for full-slide push/pop.

**Tech Stack:** React, framer-motion, Tailwind CSS, @aiszlab/bee router

---

## File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `src/components/page-transition/index.tsx` | Modify | Core animation component — mode, variants, layout |

No other files change. `withPageTransition` and `main.tsx` are unaffected.

---

### Task 1: Rewrite PageTransition for WeChat-style push

**Files:**
- Modify: `src/components/page-transition/index.tsx`

- [ ] **Step 1: Replace the PageTransition component implementation**

Replace the entire file content:

```tsx
import { AnimatePresence, motion } from "framer-motion";
import { useLocation, useNavigationType } from "@aiszlab/bee/router";
import type { ReactNode } from "react";

const VARIANTS = {
  PUSH: {
    initial: { x: "100%" },
    animate: { x: 0 },
    exit: { x: 0 },
  },
  POP: {
    initial: { x: 0 },
    animate: { x: 0 },
    exit: { x: "100%" },
  },
} as const;

const TRANSITION = {
  x: { type: "tween" as const, duration: 0.3, ease: ["easeOut", "easeIn"] as const },
};

const PageTransition = ({ children }: { children: ReactNode }) => {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();

  const direction = navigationType === "POP" ? "POP" : "PUSH";
  const variants = VARIANTS[direction];

  return (
    <div className="grid overflow-hidden">
      <AnimatePresence mode="sync" initial={false}>
        <motion.div
          key={pathname}
          className="[grid-area:1/1]"
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={TRANSITION}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default PageTransition;
export { withPageTransition } from "./with-page-transition";
```

**Key changes from current:**
- `mode="wait"` → `mode="sync"` — both pages render simultaneously
- Container div: `className="grid overflow-hidden"` — CSS grid stacks children in same cell, overflow hidden clips the offscreen page
- motion.div: `className="[grid-area:1/1]"` — both old and new page occupy the same grid cell, new page renders on top
- Variants: `x: "100%"` (full width) instead of `"30%"`, opacity removed entirely
- PUSH exit: `x: 0` — old page stays put, covered by new page
- POP exit: `x: "100%"` — current page slides right, revealing old page
- TRANSITION: opacity config removed, `ease` array typed with `as const`
- `type Easing` import removed (no longer needed)

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit --pretty`
Expected: No errors related to `src/components/page-transition/index.tsx`

- [ ] **Step 3: Manual verification — forward navigation**

Start the app and navigate forward (e.g., Home → Login). Confirm:
- New page slides in from the right edge
- Old page stays fully visible underneath (no fade, no blur)
- No blank gap between pages
- Animation duration feels right (~0.3s)

- [ ] **Step 4: Manual verification — back navigation**

Press browser/app back button. Confirm:
- Current page slides out to the right edge
- Previous page revealed underneath (stays in place, no animation)
- No fade or blur on either page

- [ ] **Step 5: Manual verification — first load**

Cold-start the app. Confirm:
- No fly-in animation on initial page load
- Page appears immediately at its final position

- [ ] **Step 6: Commit**

```bash
git add src/components/page-transition/index.tsx
git commit -m "feat: switch to WeChat-style push transition with sync mode

- Change AnimatePresence mode from 'wait' to 'sync'
- Use CSS grid stacking ([grid-area:1/1]) for page overlay
- Remove opacity from animation variants
- Full-width slide (100% instead of 30%)
- Old page stays fully visible during PUSH

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```
