# Home Welcome Implementation Plan

> Execute inline with superpowers:executing-plans.

**Goal:** Replace the homepage route diagram with the approved miniature road-trip scene and a short, nonblocking departure animation.

**Architecture:** Two registered raster layers (scenery and transparent vehicle) inside a responsive decorative component. A module-scoped playback flag survives route remounts within the app runtime. Animate only after both assets load; honor reduced motion immediately and stop when unmounted.

**Tech Stack:** React 19, CSS Modules, musae theme, generated raster assets.

**Spec:** docs/superpowers/specs/2026-11-01-home-welcome-design.md

## Global Constraints

- Preserve navigation, copy and planning actions.
- One 1.5–2 second animation per application runtime; no loops.
- Static scene for reduced motion; no animation that blocks controls.
- Keep source assets in the workspace and document prompts.

## Review Focus

- Cold image load: no car-only flash or animation before scenery is ready.
- Route return: no replay during the same runtime.
- Reduced motion changes: immediately stop at the final pose.
- Narrow and tablet widths: proportional layers, no overflow.
- Dark theme and failed assets: contained, readable composition and no broken-image icon.

## Task 1: Prepare registered scene layers

- [x] Generate scenery without the car and a transparent vehicle from the approved preview.
- [x] Save optimized production assets under `src/pages/home/assets/`; preserve alpha for the car.
- [x] Record original generation prompts and alignment adjustments.

## Task 2: Replace the route illustration

- [x] Replace `src/pages/home/route-animation.tsx` with `travel-scene.tsx`; update the home import.
- [x] Replace obsolete animation styles with responsive scene and one-shot vehicle movement styles.
- [x] Track loading, image failure, reduced motion and playback within the app runtime; hide decorative images from accessibility APIs.
- [ ] Check first entry, return navigation, image failures and reduced motion in the browser. This reversible visual change uses browser checks rather than implementation-mirroring tests.

## Task 3: Verify

- [x] Run `pnpm build`, `pnpm exec tsc --noEmit` and existing Node tests.
- [ ] Inspect phone/tablet layouts and both themes; inspect final diff and document any limitations.

## Execution notes

- User approved the art direction and preview. Continue in the existing feature branch without moving their checkout or touching `.claude/`.
- Generated vehicle framing differs from the original; register the transparent layer through proportional CSS rather than editing raster content.
- Verification: build and TypeScript passed; all 19 existing tests passed with `--test-concurrency=1`. Concurrent test run hit an existing temporary-directory cleanup race (`ENOTEMPTY` in districts.test.mjs); no product assertions failed.
- Production build was visually inspected in Chrome at 440px mobile width. Scene composition and vehicle registration look correct. Dev preview hit Vite Outdated Optimize Dep errors, so production assets were served locally on port 9530. Tablet, dark theme, reduced-motion toggle and route-return behavior were reviewed in code but not verified interactively.
- Independent review found no critical or important issues. Deferred minor: background appears directly rather than having its own entrance animation; the car is the sole moving focal point.
