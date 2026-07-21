# MindArena Game Portal Homepage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the generic landing page with a dark, modern Game Portal homepage that highlights an extensible game library and treats Arena as a secondary benefit.

**Architecture:** Keep the App Router page server-rendered and compose it from focused home components. Store featured-game presentation data in JSON so it can grow without changing layout code, isolate auth-aware statistics in one client component, and use global semantic tokens plus homepage-specific CSS utilities for the new dark-first identity.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, next/font, Lucide React, Zustand, Node built-in test runner.

---

## File map

- Modify `apps/web/src/app/layout.tsx`: load Space Grotesk and make dark the default theme.
- Modify `apps/web/src/app/globals.css`: define Game Portal tokens, motion, focus, and decorative utilities.
- Modify `apps/web/src/app/page.tsx`: compose the new homepage sections.
- Modify `apps/web/src/components/navbar.tsx`: apply the new wordmark, navigation, auth actions, and mobile behavior.
- Replace `apps/web/src/components/home/hero-section.tsx`: render the campaign copy and portal preview.
- Replace `apps/web/src/components/home/features-grid.tsx`: render the extensible featured-game grid.
- Replace `apps/web/src/components/home/footer.tsx`: render the compact dark footer.
- Delete `apps/web/src/components/home/background-gradients.tsx`: remove the generic blurred-orb treatment.
- Modify `apps/web/src/components/home/index.ts`: export the new component set.
- Create `apps/web/src/components/home/home-games.json`: hold featured-game presentation metadata.
- Create `apps/web/src/components/home/home-games.test.mjs`: validate metadata uniqueness, routes, and extensibility.
- Create `apps/web/src/components/home/game-portal-preview.tsx`: render the decorative Sequence Memory preview.
- Create `apps/web/src/components/home/player-progress.tsx`: show auth-aware existing statistics or guest benefits.
- Create `apps/web/src/components/home/arena-promo.tsx`: render the secondary Arena section.

### Task 1: Lock down extensible homepage game metadata

**Files:**
- Create: `apps/web/src/components/home/home-games.test.mjs`
- Create: `apps/web/src/components/home/home-games.json`

- [ ] **Step 1: Write the failing metadata test**

```js
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const file = new URL("./home-games.json", import.meta.url);

test("featured games have unique ids and playable routes", async () => {
  const games = JSON.parse(await readFile(file, "utf8"));
  assert.ok(games.length >= 5);
  assert.equal(new Set(games.map((game) => game.id)).size, games.length);

  for (const game of games) {
    assert.match(game.id, /^[a-z0-9-]+$/);
    assert.match(game.href, /^\/games\/[a-z0-9-]+$/);
    assert.ok(game.title.length > 0);
    assert.ok(game.description.length > 0);
    assert.ok(["sequence", "numbers", "code", "color", "grid"].includes(game.motif));
  }
});

test("adding another game does not depend on a fixed total", async () => {
  const games = JSON.parse(await readFile(file, "utf8"));
  const extra = {
    ...games[0],
    id: "future-game",
    href: "/games/future-game",
  };
  const extended = [...games, extra];
  assert.equal(extended.length, games.length + 1);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test apps/web/src/components/home/home-games.test.mjs`  
Expected: FAIL with `ENOENT` for `home-games.json`.

- [ ] **Step 3: Add current featured-game metadata**

Create `home-games.json` with objects using this exact shape:

```json
[
  {
    "id": "sequence-memory",
    "title": "Sequence Memory",
    "description": "Follow the flashes and rebuild an ever-growing sequence.",
    "category": "Memory",
    "href": "/games/sequence-memory",
    "motif": "sequence",
    "tone": "violet",
    "featured": true
  },
  {
    "id": "chimp-memory",
    "title": "Chimp Memory",
    "description": "Lock in every number before the board disappears.",
    "category": "Speed",
    "href": "/games/chimp-memory",
    "motif": "numbers",
    "tone": "mint",
    "featured": false
  },
  {
    "id": "code-memory",
    "title": "Code Memory",
    "description": "Hold the pattern in your head and rebuild the code.",
    "category": "Focus",
    "href": "/games/code-memory",
    "motif": "code",
    "tone": "pink",
    "featured": false
  },
  {
    "id": "color-word",
    "title": "Color Word",
    "description": "React to the color, ignore the word, and stay sharp.",
    "category": "Reaction",
    "href": "/games/color-word",
    "motif": "color",
    "tone": "yellow",
    "featured": false
  },
  {
    "id": "schulte-table",
    "title": "Schulte Table",
    "description": "Scan the grid and find the next number faster.",
    "category": "Attention",
    "href": "/games/schulte-table",
    "motif": "grid",
    "tone": "blue",
    "featured": false
  }
]
```

- [ ] **Step 4: Run the metadata test**

Run: `node --test apps/web/src/components/home/home-games.test.mjs`  
Expected: 2 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/components/home/home-games.json apps/web/src/components/home/home-games.test.mjs
git commit -m "test(home): define extensible featured game catalog"
```

### Task 2: Establish the dark-first visual foundations

**Files:**
- Modify: `apps/web/src/app/layout.tsx`
- Modify: `apps/web/src/app/globals.css`

- [ ] **Step 1: Record the pre-change build state**

Run: `npm.cmd run build --workspace=@mindarena/web`  
Expected: PASS on the existing branch; record any pre-existing warnings.

- [ ] **Step 2: Load display typography and default to dark**

Add `Space_Grotesk` from `next/font/google`, expose it as `--font-space-grotesk`, include it on `body`, and change `ThemeProvider` from `defaultTheme="system"` to `defaultTheme="dark"` while keeping theme switching enabled.

- [ ] **Step 3: Add semantic Game Portal tokens and shared utilities**

In `globals.css`, map semantic variables for canvas, elevated surfaces, mint, ultraviolet, reward yellow, reward pink, and muted text. Add reusable classes for display typography, tabular scores, portal grid texture, focus rings, and reduced-motion behavior. Replace the light-first root values with a dark reference palette while retaining a readable `.light` mapping for the existing theme toggle.

- [ ] **Step 4: Verify type and CSS compilation**

Run: `npm.cmd run build --workspace=@mindarena/web`  
Expected: PASS with generated `/` route and no CSS parser errors.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/app/layout.tsx apps/web/src/app/globals.css
git commit -m "feat(theme): add dark Game Portal foundations"
```

### Task 3: Build the hero portal

**Files:**
- Replace: `apps/web/src/components/home/hero-section.tsx`
- Create: `apps/web/src/components/home/game-portal-preview.tsx`

- [ ] **Step 1: Replace generic marketing copy with product-first copy**

Render one `h1`, the growing-library eyebrow, concise body copy, a primary link to `/games`, and a secondary text link to the featured-games anchor. Avoid any fixed total of games.

- [ ] **Step 2: Implement the decorative game preview**

Create a server component that renders a labelled top bar, a 4-by-6 decorative tile grid, two highlighted cells, combo and score chips, and `aria-hidden="true"` on the complete preview. Use CSS classes rather than JavaScript animation.

- [ ] **Step 3: Add responsive and reduced-motion behavior**

Ensure the preview simplifies under 640 px, reserves its dimensions to prevent layout shift, and disables highlight/floating animations under `prefers-reduced-motion`.

- [ ] **Step 4: Run lint**

Run: `npm.cmd run lint --workspace=@mindarena/web`  
Expected: PASS with no accessibility or React warnings.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/components/home/hero-section.tsx apps/web/src/components/home/game-portal-preview.tsx apps/web/src/app/globals.css
git commit -m "feat(home): add interactive-looking game portal hero"
```

### Task 4: Build the featured game library and progress teaser

**Files:**
- Replace: `apps/web/src/components/home/features-grid.tsx`
- Create: `apps/web/src/components/home/player-progress.tsx`
- Modify: `apps/web/src/components/home/index.ts`

- [ ] **Step 1: Render game cards from metadata**

Import `home-games.json`, define a local `HomeGame` type, and map every entry to a linked article. Use `featured` to span the first card on desktop, `tone` for a controlled theme class, and `motif` for accessible decorative CSS patterns. Keep “Play now” visible without hover and add a final link to `/games` labelled “Explore all games.”

- [ ] **Step 2: Implement auth-aware progress**

Make `PlayerProgress` a client component. Read `isAuthenticated`, `isHydrated`, and `user` from `useAuthStore`; call `gameResultApi.getStats("local")` through `useAuthenticatedQuery` only when authenticated. Show a three-cell skeleton while hydration or authenticated data loading is active. Show total score, total games, and `user.rankName` on success. Show “Short rounds,” “Personal bests,” and “Weekly competition” plus a sign-in link for guests or failed optional stats.

- [ ] **Step 3: Export the new sections**

Update `home/index.ts` to export `PlayerProgress` alongside `HeroSection`, `FeaturesGrid`, `ArenaPromo`, and `Footer`; remove `BackgroundGradients`.

- [ ] **Step 4: Run the metadata test and lint**

Run: `node --test apps/web/src/components/home/home-games.test.mjs`  
Expected: 2 tests PASS.  
Run: `npm.cmd run lint --workspace=@mindarena/web`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/components/home/features-grid.tsx apps/web/src/components/home/player-progress.tsx apps/web/src/components/home/index.ts
git commit -m "feat(home): add growing game library and player progress"
```

### Task 5: Add Arena promotion, footer, navigation, and page composition

**Files:**
- Create: `apps/web/src/components/home/arena-promo.tsx`
- Replace: `apps/web/src/components/home/footer.tsx`
- Modify: `apps/web/src/components/navbar.tsx`
- Modify: `apps/web/src/components/home/index.ts`
- Modify: `apps/web/src/app/page.tsx`
- Delete: `apps/web/src/components/home/background-gradients.tsx`

- [ ] **Step 1: Add the secondary Arena panel**

Render campaign copy, a link to `/arena`, and an `aria-hidden` versus composition using two abstract player panels. Keep its yellow/pink reward accents visually distinct from the mint game path.

- [ ] **Step 2: Replace the footer**

Render the MindArena wordmark, links to `/games`, `/arena`, and `/stats`, and the current copyright text. Keep the footer compact and use semantic `footer` markup.

- [ ] **Step 3: Redesign the shared navbar without changing auth behavior**

Keep the current Zustand auth state, logout flow, dropdown destinations, and mobile disclosure. Replace the brain-gradient logo with the text wordmark, change Challenges to Ranking/Stats, add a guest Quick Play link to `/games`, preserve Sign In, and ensure every icon-only or disclosure control has an accessible name and a 44 px target.

- [ ] **Step 4: Compose the route**

Replace the fixed-viewport layout in `page.tsx` with `Navbar`, `HeroSection`, `FeaturesGrid`, `PlayerProgress`, `ArenaPromo`, and `Footer` in document order. Remove `BackgroundGradients` and delete its file.

- [ ] **Step 5: Run lint and build**

Run: `npm.cmd run lint --workspace=@mindarena/web`  
Expected: PASS.  
Run: `npm.cmd run build --workspace=@mindarena/web`  
Expected: PASS and `/` prerendered successfully.

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/app/page.tsx apps/web/src/components/navbar.tsx apps/web/src/components/home
git commit -m "feat(home): compose Game Portal landing page"
```

### Task 6: End-to-end visual and accessibility verification

**Files:**
- Modify only files implicated by verification findings.

- [ ] **Step 1: Start the web app**

Run: `npm.cmd run dev --workspace=@mindarena/web`  
Expected: Next.js prints a local URL and keeps running.

- [ ] **Step 2: Verify desktop and mobile layouts**

Open `/` at 1440 px, 1024 px, 768 px, and 375 px. Confirm there is no horizontal scroll, the hero preview remains legible, the card CTA is always visible, progress does not jump after hydration, and Arena stacks copy above the visual on mobile.

- [ ] **Step 3: Verify interaction and accessibility states**

Tab through the navbar, hero actions, every game card, progress action, Arena action, and footer links. Confirm visible focus, correct order, 44 px targets, Escape/close behavior for mobile navigation, and no meaningful content inside `aria-hidden` containers.

- [ ] **Step 4: Verify reduced motion and extensibility**

Enable reduced motion and confirm hero loops stop. Temporarily duplicate one metadata item with a unique id and route, confirm the layout accepts a sixth card at desktop and mobile widths, then revert only that temporary duplicate.

- [ ] **Step 5: Run final checks**

Run: `node --test apps/web/src/components/home/home-games.test.mjs`  
Expected: 2 tests PASS.  
Run: `npm.cmd run lint --workspace=@mindarena/web`  
Expected: PASS.  
Run: `npm.cmd run build --workspace=@mindarena/web`  
Expected: PASS.

- [ ] **Step 6: Commit verification fixes**

```bash
git add apps/web
git commit -m "fix(home): polish responsive and accessible states"
```
