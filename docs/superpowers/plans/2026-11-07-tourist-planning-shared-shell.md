# Tourist Planning Shared Shell Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep the tourist planning header and footer shells mounted in `TouristPlanningLayout` while preserving step-owned footer buttons.

**Architecture:** `TouristPlanningLayout` permanently renders header and footer wrappers around `Outlet`, and passes the active step to the shared header. One flow configuration holds step order, routes, labels, titles, subtitles, and next-step relationships. Child pages portal their titles, subtitles, and footer buttons into the layout containers.

**Tech Stack:** React 19, TypeScript, `@aiszlab/bee` router, existing planning context and shared tourist-plan components.

**Spec:** `docs/superpowers/specs/2026-11-07-tourist-planning-shared-shell-design.md`

## Global Constraints

- Keep each step's button behavior and state in its existing page.
- Do not change planning state, routes, business flow, or visual styling.
- Preserve user changes already staged in package configuration and the shared header component.

## Review Focus

- Each child route must portal its matching title and subtitle.
- Changing a step must replace footer buttons without remounting the footer shell.
- Leaving and re-entering the wizard must not show stale footer content.
- Header back navigation must retain its existing behavior.
- Existing step button disabled, navigation, and submit behavior must remain intact.

---

### Task 1: Move the shared shell into the planning layout

**Files:**
- Modify: `src/contexts/tourist-planning.context.ts`
- Modify: `src/components/tourist-plan/header/index.tsx`
- Modify: `src/components/tourist-plan/footer/index.tsx`
- Modify: `src/layout/tourist-planning.layout.tsx`
- Create: `src/constants/tourist-planning.constant.ts`
- Modify: `src/pages/tourist-planning/districts/index.tsx`
- Modify: `src/pages/tourist-planning/period/index.tsx`
- Modify: `src/pages/tourist-planning/attractions/index.tsx`

**Interfaces:**
- Context adds `headerContainer` and `footerContainer` DOM nodes for child pages to use as portal targets.
- Layout owns one `TouristPlanHeader` instance and one `TouristPlanFooter` instance.

- [x] Extend header/footer shells with content refs and pass both portal targets through the planning context.
- [x] Render header and footer once in layout around `<Outlet />`; retain a page-sized flex column with the footer at the bottom.
- [x] Update each step to portal its header metadata and footer buttons into the shared containers; remove its direct header/footer wrappers and imports.
- [x] Check that route changes update portal content without replacing the shared shells; confirm shared Progress uses Musae `min`, `max`, `value`, and `aria-label` props directly.
