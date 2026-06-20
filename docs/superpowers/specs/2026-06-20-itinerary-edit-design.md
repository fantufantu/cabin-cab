# Itinerary Item Editing

## Purpose

Allow users to edit individual itinerary items (行程明细) within a tourist plan. Currently itineraries are read-only; this adds a full-page edit form with a GraphQL mutation for persistence.

## Routes

Add one new route as a child of `TouristPlanLayout`:

```
/tourist-plan/:id
├── index                          → TouristPlanProposal (proposal tab)
├── itinerary                      → TouristPlanItineraries (itinerary tab)
└── itinerary/:itineraryId/edit    → TouristPlanItineraryEdit  ← NEW
```

The edit page lives inside `TouristPlanLayout` so it has access to `DetailPlanContext` with the full `touristPlan` data, avoiding a redundant API call for the itinerary item.

## GraphQL Mutation

```graphql
mutation UpdateTouristPlanItinerary($id: String!, $input: UpdateTouristPlanItineraryInput!) {
  updateTouristPlanItinerary(id: $id, input: $input) {
    id
    dayFrom
    sortOrder
    name
    description
    tip
    duration
  }
}
```

## Types

```typescript
// Editable fields only (dayFrom and sortOrder are excluded per requirements)
type UpdateTouristPlanItineraryInput = Partial<
  Pick<Itinerary, "name" | "description" | "tip" | "duration">
>;
```

## Edit Page Component (`src/pages/tourist-plan/itinerary-edit.tsx`)

**Data in**: Read `itineraryId` from route params (`useParams`), pull the matching `Itinerary` from `useDetailPlanContext().touristPlan.itineraries`.

**UI layout** (mobile-first, consistent with existing design):
- **Header**: Back button (navigates back) + "编辑行程" title — sticky top with the same `bg-color-primary` / `safe-pt` treatment as the layout header
- **Form body**: Scrollable, with `musae` input components
- **Footer**: "保存" (Save) button, pinned to bottom via `TouristPlanFooter`

**Form fields**:

| Field | Component | Notes |
|-------|-----------|-------|
| `name` | `Input` (text) | Required, single-line |
| `description` | `Input` (textarea) | Multi-line, long text |
| `tip` | `Input` (textarea) | Multi-line |
| `duration` | `Input` (number) | Display/edit in hours, convert to/from ms for the API |

**State management**: Local `useState` initialized from the itinerary item. No sessionStorage — the source of truth is the context + API.

**Save flow**:
1. Validate: `name` is required
2. Call `UPDATE_TOURIST_PLAN_ITINERARY` mutation with all form fields
3. On success: update the itinerary in `DetailPlanContext` by replacing it in `touristPlan.itineraries` via the context's `setTouristPlan` setter, then `navigate(-1)` back to the itinerary list
4. On error: Apollo `ErrorLink` surfaces the error notification; stay on the edit page

**Context change**: `DetailPlanContextValue` gains an optional `setTouristPlan` setter so the edit page can update the itinerary in-place after a successful mutation, ensuring the itinerary list shows the latest data without a full refetch.

**Edge cases**:
- `itineraryId` not found in context → show "未找到该行程" empty state
- Save with no changes → still allowed (no-op mutation)
- Network error during save → Apollo `ErrorLink` surfaces the error notification; stay on the edit page

## Navigation Changes

**Itinerary cards** (`src/components/tourist-plan/itinerary/index.tsx`): Each card becomes clickable. Tapping navigates to `/tourist-plan/:id/itinerary/:itineraryId/edit`. The `id` param is obtained from the URL via `useParams` (or passed as a prop from the parent).

## Files Summary

| File | Change |
|------|--------|
| `src/api/tourist-plan.types.ts` | Add `UpdateTouristPlanItineraryInput` type |
| `src/api/tourist-plan.api.ts` | Add `UPDATE_TOURIST_PLAN_ITINERARY` typed mutation document |
| `src/contexts/detail-plan.context.ts` | Add `setTouristPlan` setter to `DetailPlanContextValue` |
| `src/pages/tourist-plan/layout.tsx` | Pass `setTouristPlan` into context provider |
| `src/pages/tourist-plan/itinerary-edit.tsx` | **New** — edit page component with form |
| `src/main.tsx` | Add route `/tourist-plan/:id/itinerary/:itineraryId/edit` + lazy import |
| `src/components/tourist-plan/itinerary/index.tsx` | Add `onClick` to itinerary cards, navigate with itinerary id |
