# Sequence Preview Manual Start and Category Badges Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the homepage Sequence Memory preview user-initiated and increase the contrast of all game-category labels.

**Architecture:** Keep the sequence engine unchanged and replace viewport activation with component-local `hasStarted` state. Centralize category badge presentation in `features-grid.tsx` so featured and photo cards share the same readable surface while retaining their tone color.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS, Framer Motion, Vitest, Testing Library

---

### Task 1: Replace viewport activation with an explicit preview action

**Files:**

- Modify: `apps/web/src/components/home/sequence-game-demo.tsx`
- Test: `apps/web/src/components/home/sequence-game-demo.behavior.test.tsx`

- [x] **Step 1: Remove viewport-driven state**

Replace `isActive`, `handleViewportEnter`, and `handleViewportLeave` with a `hasStarted` boolean. Gate the sequence effect with `hasStarted` and render a normal wrapper instead of a motion wrapper with viewport callbacks.

```tsx
const [hasStarted, setHasStarted] = useState(false);

if (!hasStarted) {
  return clearPhaseTimers;
}
```

- [x] **Step 2: Add the explicit start and replay action**

Add one handler that clears pending timers, resets the engine, updates the announcement, and starts the preview. When input reaches success or failure, set `hasStarted` to `false` so the result remains visible until another click.

```tsx
const startPreview = () => {
  resetPreview();
  setAnnouncement("Watch the pattern");
  setHasStarted(true);
};

if (next.phase === "success" || next.phase === "failure") {
  setHasStarted(false);
}
```

Render a native 44px action whose copy is `Start sequence` before the first run and `Play again` after either result. Keep board buttons disabled unless `state.phase === "playing" && hasStarted`.

- [x] **Step 3: Remove automatic terminal-state replay**

Delete the success and failure reset timers. Preserve the terminal status copy without `Replaying shortly`, and replace the loop helper text with copy explaining that the preview starts on demand.

### Task 2: Turn category labels into high-contrast badges

**Files:**

- Modify: `apps/web/src/components/home/features-grid.tsx`

- [x] **Step 1: Define shared badge styles**

Replace plain tone text classes with tone-specific foreground, border, and translucent background classes.

```tsx
const CATEGORY_BADGE_STYLES: Record<GameTone, string> = {
  violet: "border-[#aa9cff]/55 bg-[#120f29]/88 text-[#ddd7ff]",
  mint: "border-portal-mint/50 bg-[#081d1a]/88 text-[#c2ffe8]",
  pink: "border-portal-pink/50 bg-[#26101b]/88 text-[#ffc3d7]",
  yellow: "border-portal-yellow/50 bg-[#261f0c]/88 text-[#ffeba3]",
  blue: "border-portal-blue/50 bg-[#0b1d31]/88 text-[#c2e4ff]",
};
```

- [x] **Step 2: Apply the badge consistently**

Use the same base class in both card types.

```tsx
"inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-[0.7rem] font-black uppercase tracking-[0.14em] shadow-[0_6px_18px_rgb(0_0_0_/_0.24)] backdrop-blur-sm";
```

### Task 3: Update behavior coverage and verify once

**Files:**

- Modify: `apps/web/src/components/home/sequence-game-demo.behavior.test.tsx`
- Verify: `apps/web/src/components/home/home-games.test.mjs`
- Verify: `apps/web/src/components/home/sequence-demo-engine.test.mjs`
- Verify: `apps/web/src/components/home/sequence-game-demo.test.mjs`

- [x] **Step 1: Update the component tests for user-initiated behavior**

Remove the viewport mock controls. Assert that advancing timers while idle does nothing, clicking `Start sequence` runs the pattern, a terminal result does not restart, and `Play again` begins a fresh preview.

- [x] **Step 2: Run the complete final check once**

Run:

```powershell
npm.cmd exec -- vitest run src/components/home/sequence-game-demo.behavior.test.tsx
node --test apps/web/src/components/home/home-games.test.mjs apps/web/src/components/home/sequence-demo-engine.test.mjs apps/web/src/components/home/sequence-game-demo.test.mjs
npm.cmd run build --workspace=@mindarena/web
```

Expected: 15 tests pass and the Next.js production build completes successfully.
