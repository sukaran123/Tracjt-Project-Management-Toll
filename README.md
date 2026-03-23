# Trackt — Multi-View Project Tracker

A fully featured project management frontend with Kanban, List, and Timeline views, custom drag-and-drop, virtual scrolling, live collaboration indicators, and URL-synced filters.

## Setup Instructions

```bash
npm install
npm start        # Development server at http://localhost:3000
npm run build    # Production build
```

## State Management Decision: Zustand

I chose **Zustand** over React Context + useReducer for the following reasons:

1. **Minimal boilerplate** — No Provider wrapping, no dispatch boilerplate. State is accessed directly via `useStore(selector)` hooks.
2. **Fine-grained subscriptions** — Components only re-render when their specific slice of state changes, which is critical for performance with 500+ tasks.
3. **Simple derived state** — `getFilteredTasks()` as a computed function on the store avoids prop drilling the filtered list through every component.
4. **No context pitfalls** — React Context causes full subtree re-renders on any change; Zustand's subscriptions prevent this.

## Virtual Scrolling Implementation

Only rows currently visible in the viewport are in the DOM:

1. A **full-height spacer div** (`height = totalRows × ROW_HEIGHT`) maintains correct scroll height and scrollbar position, so the browser's native scrollbar behaves correctly.
2. On scroll, `scrollTop` is read and we calculate `startIndex = floor(scrollTop / ROW_HEIGHT) - BUFFER` and `endIndex = ceil((scrollTop + containerHeight) / ROW_HEIGHT) + BUFFER` with a 5-row buffer on each side.
3. Visible rows are rendered with `position: absolute; top: index * ROW_HEIGHT` inside the spacer, placing them at exactly the right position.
4. `requestAnimationFrame` is used to debounce scroll handler calls, preventing layout thrash on fast scrolls.
5. The DOM at any time contains at most ~20–30 rows, regardless of the 500+ total.

## Drag-and-Drop Implementation

Implemented from scratch using the **Pointer Events API** (works for both mouse and touch):

1. `pointerdown` on a card: records card's `getBoundingClientRect()` as origin, cursor offset within the card, and hides the original card while inserting a **same-height placeholder div** in its place to prevent layout shift.
2. A **ghost card** (fixed position, z-index 9999) is created and positioned via CSS `transform: translate(x, y)` — GPU-accelerated, no layout reflow.
3. `pointermove` on `window`: moves the ghost with `translate()` and checks all column bounding rects to highlight the valid drop zone.
4. `pointerup`: if over a valid column, the task's status is mutated and the board re-renders. If dropped outside any column, the ghost **animates back** to the origin coordinates using CSS transition before being removed.
5. Touch support is handled automatically by Pointer Events (the browser synthesizes pointer events from touch), with `e.preventDefault()` on `pointermove` preventing scroll interference during drag.

## Performance

- **Lighthouse Desktop score**: 95+ (see screenshot below)
- Virtual scrolling keeps DOM nodes minimal even with 500+ tasks
- Kanban re-renders are scoped — only the affected column updates
- Collaboration ticks use `setInterval` at 2.5s, not a tight loop

## One Thing to Refactor

With more time, I'd refactor the Kanban drag-and-drop to support **intra-column reordering** with a proper insertion indicator (the ghost showing where in the column the card will land), rather than just inter-column movement. This requires tracking the mouse position relative to each card in the target column to find the correct insertion index.
