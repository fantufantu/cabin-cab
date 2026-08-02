# Tourist Plan List Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Beautify the tourist plan list page with a "travel journal" visual style and add swipe-left-to-delete with Popconfirm confirmation.

**Architecture:** Three-task incremental build: add the delete API mutation, create a reusable `SwipeableCard` touch-gesture component, then wire everything together in the list page with new visual styling. Each task produces an independently testable deliverable.

**Tech Stack:** React 19, Apollo Client (useMutation), musae UI (Popconfirm, Button, IconButton, Tag, Skeleton, Message), Tailwind CSS v4, dayjs, prefers-reduced-motion for accessibility

## Global Constraints

- Use `.catch()` over `try/catch` for Promise error handling
- Use musae `Popconfirm` for delete confirmation
- Respect `prefers-reduced-motion` — skip animations when set
- All colors via CSS custom properties from `AppLayout` token bridge
- Delete mutation uses `TypedDocumentNode` pattern matching existing API layer
- List refresh via existing `EVENT_BUS_TOKENS.REFRESH_TOURIST_PLANS` event bus
- Code style: prefer `reduce` over `for...of` for aggregation

---

### Task 1: Add DELETE_TOURIST_PLAN Mutation

**Files:**
- Modify: `src/api/tourist-plan.api.ts`

**Interfaces:**
- Produces: `DELETE_TOURIST_PLAN` — `TypedDocumentNode<{ deleteTouristPlan: boolean }, { id: string }>`

- [ ] **Step 1: Add the delete mutation to tourist-plan.api.ts**

Add after the `COUNT_TOURIST_PLANS_TODAY` declaration (after line 133):

```typescript
/**
 * 删除出行计划
 */
export const DELETE_TOURIST_PLAN: TypedDocumentNode<
  {
    deleteTouristPlan: boolean;
  },
  {
    id: string;
  }
> = gql`
  mutation DeleteTouristPlan($id: String!) {
    deleteTouristPlan(id: $id)
  }
`;
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `pnpm exec tsc --noEmit --pretty src/api/tourist-plan.api.ts 2>&1 | head -20`
Expected: No errors related to the new mutation.

- [ ] **Step 3: Commit**

```bash
git add src/api/tourist-plan.api.ts
git commit -m "feat: add DELETE_TOURIST_PLAN mutation"
```

---

### Task 2: Create SwipeableCard Component

**Files:**
- Create: `src/components/swipeable-card/index.tsx`

**Interfaces:**
- Consumes: `Popconfirm` from `musae`, `IconDelete` from `musae/icons`
- Produces: `SwipeableCard` component with props:
  ```typescript
  interface SwipeableCardProps {
    /** Called after user confirms deletion via Popconfirm */
    onConfirmDelete: () => void;
    deleteLabel?: string;
    children: ReactNode;
    className?: string;
  }
  ```
- Popconfirm is rendered internally wrapping the delete action area. When user swipes to reveal and clicks the delete button, Popconfirm opens. On confirm, `onConfirmDelete` fires.

- [ ] **Step 1: Create the component file**

Create `src/components/swipeable-card/index.tsx`:

```typescript
import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { IconDelete } from "musae/icons";
import { Popconfirm } from "musae";

const SWIPE_THRESHOLD = 20;
const ACTION_WIDTH = 80;
const SPRING_DURATION = 300;

interface SwipeableCardProps {
  /** Called after user confirms deletion via Popconfirm */
  onConfirmDelete: () => void;
  deleteLabel?: string;
  children: ReactNode;
  className?: string;
}

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });
  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);
  return reduced;
}

const SwipeableCard = ({
  onConfirmDelete,
  deleteLabel = "删除",
  children,
  className = "",
}: SwipeableCardProps) => {
  const [translateX, setTranslateX] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const currentTranslate = useRef(0);
  const isDragging = useRef(false);
  const reducedMotion = useReducedMotion();

  const transitionStyle = reducedMotion
    ? {}
    : { transition: `transform ${SPRING_DURATION}ms ease-in-out` };

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      touchStartX.current = touch.clientX;
      touchStartY.current = touch.clientY;
      currentTranslate.current = isOpen ? -ACTION_WIDTH : 0;
      isDragging.current = false;
    },
    [isOpen],
  );

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartX.current;
    const deltaY = touch.clientY - touchStartY.current;

    // Detect horizontal swipe (reject vertical scroll)
    if (!isDragging.current && Math.abs(deltaX) > 5 && Math.abs(deltaX) > Math.abs(deltaY)) {
      isDragging.current = true;
    }

    if (!isDragging.current) return;

    // Clamp: can only swipe left (negative), max to -ACTION_WIDTH
    const newTranslate = Math.max(-ACTION_WIDTH, Math.min(0, currentTranslate.current + deltaX));
    setTranslateX(newTranslate);
  }, []);

  const onTouchEnd = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;

    // Snap: if swiped left past SWIPE_THRESHOLD, open. Else close.
    if (translateX < -SWIPE_THRESHOLD) {
      setTranslateX(-ACTION_WIDTH);
      setIsOpen(true);
    } else {
      setTranslateX(0);
      setIsOpen(false);
    }
  }, [translateX]);

  const close = useCallback(() => {
    setTranslateX(0);
    setIsOpen(false);
  }, []);

  return (
    <div className={`relative overflow-hidden rounded-2xl ${className}`}>
      {/* Delete action — rendered behind the card, wrapped in Popconfirm */}
      <div
        className="absolute top-0 right-0 bottom-0 flex flex-col items-center justify-center gap-1 rounded-r-2xl"
        style={{
          width: ACTION_WIDTH,
          backgroundColor: "var(--color-error)",
          color: "var(--color-on-error)",
        }}
      >
        <Popconfirm
          title="确定删除此行程吗？"
          content="删除后无法恢复。"
          placement="top"
          onConfirm={onConfirmDelete}
        >
          <div className="flex flex-col items-center justify-center gap-1 w-full h-full">
            <IconDelete size={20} />
            <span className="text-xs">{deleteLabel}</span>
          </div>
        </Popconfirm>
      </div>

      {/* Card content — slides over the delete action */}
      <div
        className="relative bg-color-surface-container-low"
        style={{
          ...transitionStyle,
          transform: `translateX(${translateX}px)`,
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {children}
      </div>
    </div>
  );
};

export default SwipeableCard;
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `pnpm exec tsc --noEmit --pretty src/components/swipeable-card/index.tsx 2>&1 | head -20`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/swipeable-card/index.tsx
git commit -m "feat: add SwipeableCard component with touch gesture support"
```

---

### Task 3: Redesign List Page with Swipe-to-Delete

**Files:**
- Modify: `src/pages/tourist-plan/list/index.tsx`

**Interfaces:**
- Consumes: `DELETE_TOURIST_PLAN` from `src/api/tourist-plan.api.ts` (Task 1)
- Consumes: `SwipeableCard` from `src/components/swipeable-card/index.tsx` (Task 2)
- Consumes: `useMutation` from `@apollo/client`
- Consumes: `EVENT_BUS_TOKENS` from `src/stores/event-bus.store`
- Produces: Redesigned list page with swipe-to-delete and staggered entry

- [ ] **Step 1: Rewrite the list page component**

Replace entire contents of `src/pages/tourist-plan/list/index.tsx`:

```typescript
import { useLazyQuery, useMutation } from "@apollo/client";
import { TOURIST_PLANS, DELETE_TOURIST_PLAN } from "../../../api/tourist-plan.api";
import { useNavigate } from "@aiszlab/bee/router";
import { Button, IconButton, Skeleton, Tag, Message } from "musae";
import { useMounted, useRequest } from "@aiszlab/relax";
import { useEffect, useMemo, useState } from "react";
import { IconKeyboardArrowLeft, IconLocationOn } from "musae/icons";
import dayjs from "dayjs";
import { useAuthStore } from "../../../stores/auth.store";
import { EVENT_BUS_TOKENS, useEventBusStore } from "../../../stores/event-bus.store";
import SwipeableCard from "../../../components/swipeable-card";

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });
  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);
  return reduced;
}

function TouristPlanList() {
  const [queryTouristPlans] = useLazyQuery(TOURIST_PLANS, {
    fetchPolicy: "no-cache",
  });
  const [deleteTouristPlan, { loading: deleting }] = useMutation(DELETE_TOURIST_PLAN);
  const navigate = useNavigate();
  const { myId } = useAuthStore();
  const { on, emit } = useEventBusStore();
  const reducedMotion = useReducedMotion();

  const { data, loading, run } = useRequest(
    async () => {
      return (
        await queryTouristPlans({
          variables: { filter: { belongToId: await myId() } },
        })
      ).data;
    },
    { auto: true },
  );

  useMounted(() => {
    return on(EVENT_BUS_TOKENS.REFRESH_TOURIST_PLANS, () => {
      run();
    });
  });

  const touristPlans = useMemo(() => {
    return data?.touristPlans.items ?? [];
  }, [data]);

  const toHome = () => {
    navigate("/");
  };

  const handleDelete = async (id: string) => {
    const result = await deleteTouristPlan({ variables: { id } }).catch(() => null);
    if (!result) return;
    Message.success({ description: "行程已删除" });
    run();
  };

  const [visibleItems, setVisibleItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (touristPlans.length === 0) return;
    if (reducedMotion) {
      setVisibleItems(new Set(touristPlans.map((p) => p.id)));
      return;
    }
    touristPlans.forEach((plan, i) => {
      const timer = setTimeout(() => {
        setVisibleItems((prev) => new Set(prev).add(plan.id));
      }, i * 60);
      return () => clearTimeout(timer);
    });
  }, [touristPlans, reducedMotion]);

  return (
    <div className="flex flex-col min-h-screen bg-color-surface">
      {/* Header */}
      <div className="bg-color-primary text-color-on-primary p-5 safe-pt-5 flex items-center justify-center sticky top-0 z-50">
        <IconButton size="small" color="secondary" className="absolute left-5" onClick={toHome}>
          <IconKeyboardArrowLeft size={24} />
        </IconButton>
        <h1 className="text-xl font-medium tracking-wide">我的出行计划</h1>
      </div>

      <div className="flex flex-col gap-4 p-4">
        {/* Loading skeletons */}
        {loading &&
          touristPlans.length === 0 &&
          Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-color-surface-container-low p-4 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <Skeleton className="h-5 w-20 rounded" />
                <Skeleton className="h-4 w-40 rounded" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16 rounded" />
                <Skeleton className="h-6 w-16 rounded" />
                <Skeleton className="h-6 w-14 rounded" />
              </div>
              <Skeleton className="h-4 w-16 rounded" />
            </div>
          ))}

        {/* Empty state */}
        {!loading && touristPlans.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-color-on-surface-variant">
            <div className="text-6xl mb-4">🗺️</div>
            <p className="text-lg font-medium text-color-on-surface">还没有出行计划</p>
            <p className="text-sm mt-2 text-color-on-surface-variant">开启你的第一段旅程吧</p>
            <Button
              className="mt-6"
              onClick={() => navigate("/tourist-plan/cities")}
            >
              创建行程
            </Button>
          </div>
        )}

        {/* Plan cards */}
        {touristPlans.length > 0 &&
          touristPlans.map((plan) => (
            <div
              key={plan.id}
              style={{
                opacity: reducedMotion || visibleItems.has(plan.id) ? 1 : 0,
                transform: reducedMotion || visibleItems.has(plan.id)
                  ? "translateY(0)"
                  : "translateY(16px)",
                transition: "opacity 350ms ease-out, transform 350ms ease-out",
              }}
            >
              <SwipeableCard
                onConfirmDelete={() => handleDelete(plan.id)}
                className="shadow-sm"
              >
                <div
                  className="border-l-4 p-4 flex flex-col gap-3 cursor-pointer active:bg-color-surface-container-high"
                  style={{ borderColor: "var(--color-primary)" }}
                  onClick={() => navigate(`/tourist-plan/${plan.id}`)}
                >
                  {/* Title row */}
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold tracking-wide text-color-on-surface">
                      {plan.duration}天行程
                    </span>
                    <span className="text-sm tabular-nums text-color-on-surface-variant">
                      {dayjs(plan.depatureAt).format("YYYY/MM/DD")}
                      {" - "}
                      {dayjs(plan.depatureAt).add(plan.duration, "day").format("YYYY/MM/DD")}
                    </span>
                  </div>

                  {/* City tags */}
                  <div className="flex flex-wrap gap-2">
                    {plan.cities.map((city) => (
                      <Tag key={city.code}>
                        <IconLocationOn />
                        {city.name}
                      </Tag>
                    ))}
                  </div>

                  {/* Attraction count */}
                  <div className="text-xs text-color-on-surface-variant">
                    {plan.attractions.length}个景点
                  </div>
                </div>
              </SwipeableCard>
            </div>
          ))}
      </div>
    </div>
  );
}

export default TouristPlanList;
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `pnpm exec tsc --noEmit --pretty 2>&1 | head -30`
Expected: No errors related to the list page or SwipeableCard.

- [ ] **Step 3: Start dev server and visually verify**

Run: `pnpm dev`
Open `http://localhost:9527/tourist-plan/list`
Check:
- Cards render with bookmark stripe (left primary border) and `rounded-2xl`
- Page background is visible with `bg-color-surface`
- Cards have `shadow-sm` and `bg-color-surface-container-low`
- Swipe left on a card reveals the red delete area
- Clicking delete shows Popconfirm
- Type scale is correct (title `text-lg font-semibold`, dates `tabular-nums`, etc.)
- Staggered fade-in on page load
- Empty state has emoji + CTA button

- [ ] **Step 4: Commit**

```bash
git add src/pages/tourist-plan/list/index.tsx
git commit -m "feat: redesign plan list page with swipe-to-delete and travel-journal styling"
```
