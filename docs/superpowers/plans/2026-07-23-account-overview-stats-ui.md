# Account Overview Stats UI Implementation Plan

> **For agentic workers:** Implement task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Smooth Personal Practice / Friend Duels switching with a shared bento stats layout on `/account` Overview.

**Architecture:** New presentational `StatsBento` for both modes; Framer Motion sliding pill on the mode toggle and `AnimatePresence` crossfade around mode content; reuse existing stats data.

**Tech Stack:** React, Next.js, Tailwind, Framer Motion, Lucide

**Spec:** `docs/superpowers/specs/2026-07-23-account-overview-stats-ui-design.md`

---

### Task 1: StatsBento component

**Files:**
- Create: `apps/web/src/components/account/stats-bento.tsx`

- [x] Build `StatsBento` with hero + 3 secondary metrics (icon, label, value, subtext)
- [x] Responsive grid: hero left on `lg+`, stacked on mobile
- [x] Optional count-up respecting `useReducedMotion`
- [x] Export `StatsBentoSkeleton` mirroring the grid

### Task 2: Wire Practice + Duels

**Files:**
- Modify: `apps/web/src/components/account/stats-overview.tsx`
- Modify: `apps/web/src/components/account/friend-stats-section.tsx`
- Modify: `apps/web/src/components/account/local-stats-section.tsx`

- [x] Practice: Total Score hero; games, avg, level secondary
- [x] Duels: Win Rate hero; total, wins, losses secondary
- [x] Replace loading skeletons with `StatsBentoSkeleton`

### Task 3: Mode toggle motion

**Files:**
- Modify: `apps/web/src/components/account/account-page-content.tsx`

- [x] Sliding pill (`layoutId`) on Practice / Duels toggle
- [x] `AnimatePresence mode="wait"` around mode sections
- [x] Honor `useReducedMotion` (instant swap / static pill)

### Task 4: Verify

- [x] Typecheck / lint touched files
- [ ] Manual sanity: both modes render, toggle animates
