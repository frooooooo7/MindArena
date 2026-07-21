# Homepage Photo Game Cards and Motion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the homepage featured-games section into screenshot-led game cards, add a playable 3×3 Sequence preview, and introduce restrained Framer Motion reveals plus native smooth scrolling.

**Architecture:** Keep `home-games.json` as the catalog source of truth, with optional image presentation metadata for supporting cards. Isolate Sequence rules in a pure TypeScript state engine, render its timers and controls in a focused client component, and keep all viewport animation policy in reusable Framer Motion boundaries that honor reduced motion.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, `next/image`, Framer Motion, Node 24 test runner, ESLint.

---

## File map

- Create `apps/web/public/game_photos/chimp.png`: runtime Chimp Memory screenshot.
- Create `apps/web/public/game_photos/code_memory.png`: runtime Code Memory screenshot.
- Create `apps/web/public/game_photos/colours.png`: runtime Color Word screenshot.
- Create `apps/web/public/game_photos/schulte.png`: runtime Schulte Table screenshot.
- Modify `apps/web/src/components/home/home-games.json`: add optional image source, fit, and position metadata.
- Modify `apps/web/src/components/home/home-games.test.mjs`: enforce artwork mapping and runtime file presence without fixing the catalog total.
- Create `apps/web/src/components/home/sequence-demo-engine.ts`: pure Sequence preview state transitions.
- Create `apps/web/src/components/home/sequence-demo-engine.test.mjs`: state-engine unit tests.
- Create `apps/web/src/components/home/sequence-game-demo.tsx`: client-side timers, announcements, and 3×3 buttons.
- Create `apps/web/src/components/home/sequence-game-demo.test.mjs`: accessibility and composition contract.
- Modify `apps/web/src/components/home/features-grid.tsx`: render the interactive featured card and screenshot-led supporting cards.
- Create `apps/web/src/components/home/features-grid.test.mjs`: card composition contract.
- Create `apps/web/src/components/home/scroll-reveal.tsx`: reusable one-time viewport reveal.
- Create `apps/web/src/components/home/homepage-motion.test.mjs`: motion dependency, reveal usage, smooth-scroll, and reduced-motion contract.
- Modify `apps/web/src/components/home/index.ts`: export the reveal wrapper.
- Modify `apps/web/src/app/page.tsx`: reveal progress and Arena sections while scrolling.
- Modify `apps/web/src/app/globals.css`: enable native smooth scrolling with the existing reduced-motion override.
- Modify `apps/web/package.json` and root `package-lock.json`: add `framer-motion` to the web workspace.

### Task 1: Define and satisfy the game artwork contract

**Files:**
- Modify: `apps/web/src/components/home/home-games.test.mjs`
- Modify: `apps/web/src/components/home/home-games.json`
- Create: `apps/web/public/game_photos/chimp.png`
- Create: `apps/web/public/game_photos/code_memory.png`
- Create: `apps/web/public/game_photos/colours.png`
- Create: `apps/web/public/game_photos/schulte.png`

- [ ] **Step 1: Extend the catalog test before copying or configuring artwork**

Replace `home-games.test.mjs` with:

```js
import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";

const file = new URL("./home-games.json", import.meta.url);

const expectedArtwork = new Map([
  ["chimp-memory", "/game_photos/chimp.png"],
  ["code-memory", "/game_photos/code_memory.png"],
  ["color-word", "/game_photos/colours.png"],
  ["schulte-table", "/game_photos/schulte.png"],
]);

async function readGames() {
  return JSON.parse(await readFile(file, "utf8"));
}

test("featured games have unique ids and playable routes", async () => {
  const games = await readGames();

  assert.ok(games.length >= 5);
  assert.equal(new Set(games.map((game) => game.id)).size, games.length);

  for (const game of games) {
    assert.match(game.id, /^[a-z0-9-]+$/);
    assert.match(game.href, /^\/games\/[a-z0-9-]+$/);
    assert.ok(game.title.length > 0);
    assert.ok(game.description.length > 0);
    assert.ok(
      ["sequence", "numbers", "code", "color", "grid"].includes(
        game.motif,
      ),
    );
  }
});

test("supporting cards map to runtime game screenshots", async () => {
  const games = await readGames();

  for (const [id, image] of expectedArtwork) {
    const game = games.find((entry) => entry.id === id);
    assert.ok(game, `Missing game metadata for ${id}`);
    assert.equal(game.image, image);
    assert.ok(["cover", "contain"].includes(game.imageFit));
    assert.equal(typeof game.imagePosition, "string");

    const asset = new URL(`../../../public${image}`, import.meta.url);
    assert.ok((await stat(asset)).isFile(), `Missing runtime asset ${image}`);
  }

  const sequence = games.find((game) => game.id === "sequence-memory");
  assert.ok(sequence);
  assert.equal(sequence.image, undefined);
});

test("adding another game does not depend on a fixed total", async () => {
  const games = await readGames();
  const extra = {
    ...games[0],
    id: "future-game",
    href: "/games/future-game",
  };
  const extended = [...games, extra];

  assert.equal(extended.length, games.length + 1);
});
```

- [ ] **Step 2: Run the catalog test and verify the new contract fails**

Run:

```powershell
node --test apps/web/src/components/home/home-games.test.mjs
```

Expected: the new artwork test fails because supporting entries have no `image` metadata yet.

- [ ] **Step 3: Copy the four user-provided screenshots without changing the source folder**

Run these exact PowerShell commands from the repository root:

```powershell
New-Item -ItemType Directory -Force -Path 'apps/web/public/game_photos'
Copy-Item -LiteralPath 'game_photos/chimp.png' -Destination 'apps/web/public/game_photos/chimp.png'
Copy-Item -LiteralPath 'game_photos/code_memory.png' -Destination 'apps/web/public/game_photos/code_memory.png'
Copy-Item -LiteralPath 'game_photos/colours.png' -Destination 'apps/web/public/game_photos/colours.png'
Copy-Item -LiteralPath 'game_photos/schulte.png' -Destination 'apps/web/public/game_photos/schulte.png'
```

Do not move or delete the root `game_photos/` files.

- [ ] **Step 4: Add presentation metadata to the four supporting entries**

Replace `home-games.json` with the complete catalog below:

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
    "featured": false,
    "image": "/game_photos/chimp.png",
    "imageFit": "cover",
    "imagePosition": "center 45%"
  },
  {
    "id": "code-memory",
    "title": "Code Memory",
    "description": "Hold the pattern in your head and rebuild the code.",
    "category": "Focus",
    "href": "/games/code-memory",
    "motif": "code",
    "tone": "pink",
    "featured": false,
    "image": "/game_photos/code_memory.png",
    "imageFit": "contain",
    "imagePosition": "center"
  },
  {
    "id": "color-word",
    "title": "Color Word",
    "description": "React to the color, ignore the word, and stay sharp.",
    "category": "Reaction",
    "href": "/games/color-word",
    "motif": "color",
    "tone": "yellow",
    "featured": false,
    "image": "/game_photos/colours.png",
    "imageFit": "cover",
    "imagePosition": "center 45%"
  },
  {
    "id": "schulte-table",
    "title": "Schulte Table",
    "description": "Scan the grid and find the next number faster.",
    "category": "Attention",
    "href": "/games/schulte-table",
    "motif": "grid",
    "tone": "blue",
    "featured": false,
    "image": "/game_photos/schulte.png",
    "imageFit": "cover",
    "imagePosition": "center 38%"
  }
]
```

- [ ] **Step 5: Run the catalog test and verify it passes**

Run:

```powershell
node --test apps/web/src/components/home/home-games.test.mjs
```

Expected: 3 tests pass and no test assumes that five is the permanent catalog size.

- [ ] **Step 6: Commit the artwork contract and runtime assets**

```powershell
git add apps/web/src/components/home/home-games.json apps/web/src/components/home/home-games.test.mjs apps/web/public/game_photos
git commit -m "feat(home): add game card artwork"
```

### Task 2: Build the Sequence preview state engine with TDD

**Files:**
- Create: `apps/web/src/components/home/sequence-demo-engine.test.mjs`
- Create: `apps/web/src/components/home/sequence-demo-engine.ts`

- [ ] **Step 1: Write failing tests for phase transitions and input validation**

Create `sequence-demo-engine.test.mjs`:

```js
import assert from "node:assert/strict";
import test from "node:test";
import {
  acceptSequenceInput,
  beginPlayerTurn,
  createSequenceDemoState,
  PREVIEW_SEQUENCE,
  resetSequenceDemo,
} from "./sequence-demo-engine.ts";

test("a correct prefix advances the player input index", () => {
  const playing = beginPlayerTurn(createSequenceDemoState());
  const next = acceptSequenceInput(playing, PREVIEW_SEQUENCE[0]);

  assert.equal(next.phase, "playing");
  assert.equal(next.inputIndex, 1);
});

test("an incorrect cell moves the preview to failure", () => {
  const playing = beginPlayerTurn(createSequenceDemoState());
  const wrongCell = PREVIEW_SEQUENCE[0] === 0 ? 1 : 0;
  const next = acceptSequenceInput(playing, wrongCell);

  assert.deepEqual(next, { phase: "failure", inputIndex: 0 });
});

test("the final correct cell completes the preview", () => {
  let state = beginPlayerTurn(createSequenceDemoState());

  for (const cell of PREVIEW_SEQUENCE) {
    state = acceptSequenceInput(state, cell);
  }

  assert.equal(state.phase, "success");
  assert.equal(state.inputIndex, PREVIEW_SEQUENCE.length);
});

test("input outside the playing phase is ignored", () => {
  const watching = createSequenceDemoState();
  assert.equal(acceptSequenceInput(watching, PREVIEW_SEQUENCE[0]), watching);
});

test("reset returns to a clean watching phase", () => {
  const reset = resetSequenceDemo();
  assert.deepEqual(reset, { phase: "watching", inputIndex: 0 });
});
```

- [ ] **Step 2: Run the state-engine tests and verify the missing module failure**

Run:

```powershell
node --test apps/web/src/components/home/sequence-demo-engine.test.mjs
```

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `sequence-demo-engine.ts`.

- [ ] **Step 3: Implement the minimal pure state engine**

Create `sequence-demo-engine.ts`:

```ts
export const PREVIEW_SEQUENCE = [4, 1, 7] as const;

export type SequenceDemoPhase =
  | "watching"
  | "playing"
  | "success"
  | "failure";

export interface SequenceDemoState {
  phase: SequenceDemoPhase;
  inputIndex: number;
}

export function createSequenceDemoState(): SequenceDemoState {
  return { phase: "watching", inputIndex: 0 };
}

export function beginPlayerTurn(
  state: SequenceDemoState,
): SequenceDemoState {
  if (state.phase !== "watching") return state;
  return { phase: "playing", inputIndex: 0 };
}

export function acceptSequenceInput(
  state: SequenceDemoState,
  cell: number,
  sequence: readonly number[] = PREVIEW_SEQUENCE,
): SequenceDemoState {
  if (state.phase !== "playing") return state;

  if (sequence[state.inputIndex] !== cell) {
    return { phase: "failure", inputIndex: state.inputIndex };
  }

  const inputIndex = state.inputIndex + 1;
  if (inputIndex === sequence.length) {
    return { phase: "success", inputIndex };
  }

  return { phase: "playing", inputIndex };
}

export function resetSequenceDemo(): SequenceDemoState {
  return createSequenceDemoState();
}
```

- [ ] **Step 4: Run the state-engine tests and verify all cases pass**

Run:

```powershell
node --test apps/web/src/components/home/sequence-demo-engine.test.mjs
```

Expected: 5 tests pass.

- [ ] **Step 5: Commit the state engine**

```powershell
git add apps/web/src/components/home/sequence-demo-engine.ts apps/web/src/components/home/sequence-demo-engine.test.mjs
git commit -m "feat(home): add sequence preview engine"
```

### Task 3: Add the accessible animated Sequence component

**Files:**
- Create: `apps/web/src/components/home/sequence-game-demo.test.mjs`
- Create: `apps/web/src/components/home/sequence-game-demo.tsx`
- Modify: `apps/web/package.json`
- Modify: `package-lock.json`

- [ ] **Step 1: Write the component composition contract before the component exists**

Create `sequence-game-demo.test.mjs`:

```js
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const component = new URL("./sequence-game-demo.tsx", import.meta.url);

test("sequence preview exposes buttons, live status, and a full-game route", async () => {
  const source = await readFile(component, "utf8");

  assert.match(source, /aria-live="polite"/);
  assert.match(source, /type="button"/);
  assert.match(source, /state\.phase !== "playing"/);
  assert.match(source, /href="\/games\/sequence-memory"/);
  assert.match(source, /Array\.from\(\{ length: 9 \}/);
});
```

- [ ] **Step 2: Run the component contract and verify it fails because the file is absent**

Run:

```powershell
node --test apps/web/src/components/home/sequence-game-demo.test.mjs
```

Expected: FAIL with `ENOENT` for `sequence-game-demo.tsx`.

- [ ] **Step 3: Install Framer Motion in the web workspace**

Run:

```powershell
npm.cmd install framer-motion --workspace=@mindarena/web
```

Expected: `framer-motion` appears under `apps/web/package.json` dependencies and the root lockfile is updated.

- [ ] **Step 4: Implement the client component with timer cleanup and reduced-motion behavior**

Create `sequence-game-demo.tsx`:

```tsx
"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
  acceptSequenceInput,
  beginPlayerTurn,
  createSequenceDemoState,
  PREVIEW_SEQUENCE,
  resetSequenceDemo,
} from "./sequence-demo-engine";

const FLASH_STEP_MS = 520;
const FLASH_VISIBLE_MS = 280;
const FAILURE_RESET_MS = 1300;
const SUCCESS_RESET_MS = 2800;

const STATUS_COPY = {
  watching: "Watch the pattern",
  playing: "Your turn",
  success: "Pattern complete",
  failure: "Almost — watch once more",
} as const;

export function SequenceGameDemo() {
  const reduceMotion = Boolean(useReducedMotion());
  const [state, setState] = useState(createSequenceDemoState);
  const [activeCell, setActiveCell] = useState<number | null>(null);
  const [announcement, setAnnouncement] = useState(STATUS_COPY.watching);
  const pressTimer = useRef<number | null>(null);

  useEffect(() => {
    const timers: number[] = [];

    if (state.phase === "watching") {
      setAnnouncement(STATUS_COPY.watching);

      PREVIEW_SEQUENCE.forEach((cell, index) => {
        const start = index * FLASH_STEP_MS;
        timers.push(
          window.setTimeout(() => {
            setActiveCell(cell);
            setAnnouncement(`Pattern tile ${cell + 1}`);
          }, start),
          window.setTimeout(() => setActiveCell(null), start + FLASH_VISIBLE_MS),
        );
      });

      timers.push(
        window.setTimeout(() => {
          setState(beginPlayerTurn);
          setAnnouncement(STATUS_COPY.playing);
        }, PREVIEW_SEQUENCE.length * FLASH_STEP_MS),
      );
    }

    if (state.phase === "failure") {
      setAnnouncement(STATUS_COPY.failure);
      timers.push(
        window.setTimeout(() => setState(resetSequenceDemo()), FAILURE_RESET_MS),
      );
    }

    if (state.phase === "success") {
      setAnnouncement(STATUS_COPY.success);
      timers.push(
        window.setTimeout(() => setState(resetSequenceDemo()), SUCCESS_RESET_MS),
      );
    }

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [state.phase]);

  useEffect(
    () => () => {
      if (pressTimer.current !== null) window.clearTimeout(pressTimer.current);
    },
    [],
  );

  function handleCell(cell: number) {
    const next = acceptSequenceInput(state, cell);
    if (next === state) return;

    if (pressTimer.current !== null) window.clearTimeout(pressTimer.current);
    setActiveCell(cell);
    pressTimer.current = window.setTimeout(() => setActiveCell(null), 180);
    setState(next);

    if (next.phase === "playing") {
      setAnnouncement(`Correct. ${next.inputIndex} of ${PREVIEW_SEQUENCE.length}`);
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-3 flex min-h-11 items-center justify-between gap-3 text-xs font-bold uppercase tracking-[0.12em]">
        <span className="text-white/65">{STATUS_COPY[state.phase]}</span>
        <span className="score-figures text-portal-mint">
          {state.inputIndex}/{PREVIEW_SEQUENCE.length}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2.5" aria-label="Sequence Memory preview">
        {Array.from({ length: 9 }, (_, cell) => {
          const active = activeCell === cell;
          const disabled = state.phase !== "playing";

          return (
            <motion.button
              key={cell}
              type="button"
              aria-label={`Sequence tile ${cell + 1}`}
              disabled={disabled}
              onClick={() => handleCell(cell)}
              animate={{ scale: active && !reduceMotion ? 1.04 : 1 }}
              whileTap={disabled || reduceMotion ? undefined : { scale: 0.96 }}
              transition={{ duration: reduceMotion ? 0 : 0.18, ease: "easeOut" }}
              className={cn(
                "aspect-square min-h-11 rounded-xl border transition-[background-color,border-color,box-shadow] duration-200",
                active
                  ? "border-portal-mint bg-portal-mint shadow-[0_0_24px_rgb(112_245_193_/_0.42)]"
                  : "border-white/12 bg-white/8",
                disabled ? "cursor-default" : "cursor-pointer hover:border-white/35",
              )}
            />
          );
        })}
      </div>

      <span className="sr-only" aria-live="polite">
        {announcement}
      </span>

      <div className="mt-4 flex min-h-11 flex-wrap items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 text-xs text-white/55">
          <RotateCcw className="size-3.5" aria-hidden="true" />
          Preview loops automatically
        </span>
        <Link
          href="/games/sequence-memory"
          className="inline-flex min-h-11 items-center gap-2 rounded-full px-2 text-xs font-extrabold uppercase tracking-[0.12em] text-white hover:text-portal-mint"
        >
          Play full game
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Run the engine and component tests**

Run:

```powershell
node --test apps/web/src/components/home/sequence-demo-engine.test.mjs apps/web/src/components/home/sequence-game-demo.test.mjs
```

Expected: 6 tests pass in total.

- [ ] **Step 6: Commit the interactive preview component and dependency**

```powershell
git add apps/web/src/components/home/sequence-game-demo.tsx apps/web/src/components/home/sequence-game-demo.test.mjs apps/web/package.json package-lock.json
git commit -m "feat(home): add interactive sequence preview"
```

### Task 4: Rebuild the featured-games cards around screenshots

**Files:**
- Create: `apps/web/src/components/home/features-grid.test.mjs`
- Modify: `apps/web/src/components/home/features-grid.tsx`

- [ ] **Step 1: Write the rendering contract before changing the grid**

Create `features-grid.test.mjs`:

```js
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const component = new URL("./features-grid.tsx", import.meta.url);

test("featured games combine the sequence demo with optimized photo cards", async () => {
  const source = await readFile(component, "utf8");

  assert.match(source, /from "next\/image"/);
  assert.match(source, /SequenceGameDemo/);
  assert.match(source, /game\.imageFit === "contain"/);
  assert.match(source, /alt=""/);
  assert.match(source, /aria-labelledby=\{`\$\{game\.id\}-title`\}/);
  assert.match(source, /staggerChildren: reduceMotion \? 0 : 0\.04/);
});
```

- [ ] **Step 2: Run the grid contract and verify it fails on the old motif-only implementation**

Run:

```powershell
node --test apps/web/src/components/home/features-grid.test.mjs
```

Expected: FAIL because `features-grid.tsx` does not import `next/image` or `SequenceGameDemo`.

- [ ] **Step 3: Replace the motif-only card renderer with photo and Sequence variants**

Update `features-grid.tsx` so it has a client boundary, imports `Image`, `motion`, `useReducedMotion`, `cn`, and `SequenceGameDemo`, and uses these exact metadata types:

```tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, type Variants, useReducedMotion } from "framer-motion";
import { ArrowRight, Layers3 } from "lucide-react";
import { cn } from "@/lib/utils";
import homeGames from "./home-games.json";
import { SequenceGameDemo } from "./sequence-game-demo";

type GameMotif = "sequence" | "numbers" | "code" | "color" | "grid";
type GameTone = "violet" | "mint" | "pink" | "yellow" | "blue";
type GameImageFit = "cover" | "contain";

interface HomeGame {
  id: string;
  title: string;
  description: string;
  category: string;
  href: string;
  motif: GameMotif;
  tone: GameTone;
  featured: boolean;
  image?: string;
  imageFit?: GameImageFit;
  imagePosition?: string;
}
```

Retain the existing `TONE_STYLES` and `TONE_ACCENTS`. Retain `GameMotif` only as the fallback when `game.image` is absent. Add these two focused card renderers:

```tsx
function SequenceGameCard({ game, variants }: { game: HomeGame; variants: Variants }) {
  return (
    <motion.article
      variants={variants}
      className={cn(
        "relative isolate row-span-2 flex overflow-hidden rounded-[1.4rem] border p-5 sm:p-6 md:col-span-2 lg:col-span-6",
        TONE_STYLES[game.tone],
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-4">
          <span className={cn("text-[0.65rem] font-black uppercase tracking-[0.19em]", TONE_ACCENTS[game.tone])}>
            {game.category}
          </span>
          <span className="text-xs font-bold uppercase tracking-[0.12em] text-white/45">
            Live preview
          </span>
        </div>

        <div className="my-6 flex flex-1 items-center justify-center sm:my-8">
          <SequenceGameDemo />
        </div>

        <div>
          <h3 className="font-display text-3xl font-bold tracking-[-0.035em] sm:text-4xl">
            {game.title}
          </h3>
          <p className="mt-2 max-w-sm text-sm leading-5 text-white/58">
            {game.description}
          </p>
        </div>
      </div>
    </motion.article>
  );
}

function PhotoGameCard({
  game,
  variants,
  reduceMotion,
}: {
  game: HomeGame;
  variants: Variants;
  reduceMotion: boolean;
}) {
  return (
    <motion.article
      variants={variants}
      whileHover={reduceMotion ? undefined : { y: -4 }}
      transition={{ duration: reduceMotion ? 0 : 0.2, ease: "easeOut" }}
      className={cn(
        "group relative isolate overflow-hidden rounded-[1.4rem] border lg:col-span-3",
        TONE_STYLES[game.tone],
      )}
    >
      <Link
        href={game.href}
        aria-labelledby={`${game.id}-title`}
        className="absolute inset-0 z-20 rounded-[1.4rem]"
      />

      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        {game.image ? (
          <Image
            src={game.image}
            alt=""
            fill
            sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 25vw"
            style={{ objectPosition: game.imagePosition }}
            className={cn(
              "transition-transform duration-300 ease-out",
              game.imageFit === "contain" ? "object-contain p-5" : "object-cover",
              !reduceMotion && "group-hover:scale-[1.03]",
            )}
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center p-6">
            <GameMotif motif={game.motif} featured={false} />
          </div>
        )}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(5_8_17_/_0.08)_0%,rgb(7_10_20_/_0.48)_45%,rgb(7_10_20_/_0.96)_100%)]" />
      </div>

      <div className="pointer-events-none relative z-10 flex h-full min-h-0 flex-col justify-between p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <span className={cn("text-[0.65rem] font-black uppercase tracking-[0.19em] drop-shadow", TONE_ACCENTS[game.tone])}>
            {game.category}
          </span>
          <ArrowRight className="size-4 text-white/55 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-white" aria-hidden="true" />
        </div>

        <div>
          <h3 id={`${game.id}-title`} className="font-display text-xl font-bold tracking-[-0.035em] text-white">
            {game.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-xs leading-5 text-white/72">
            {game.description}
          </p>
          <span className="mt-3 inline-flex min-h-11 items-center text-xs font-extrabold uppercase tracking-[0.12em] text-white">
            Play now
          </span>
        </div>
      </div>
    </motion.article>
  );
}
```

Inside `FeaturesGrid`, derive reduced motion and define the reveal variants exactly once:

```tsx
const reduceMotion = Boolean(useReducedMotion());
const itemVariants: Variants = {
  hidden: { opacity: 0, y: reduceMotion ? 0 : 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: reduceMotion ? 0 : 0.32, ease: "easeOut" },
  },
};
const gridVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: reduceMotion ? 0 : 0.04 },
  },
};
```

Replace the current grid container with:

```tsx
<motion.div
  className="grid auto-rows-[15.5rem] gap-3 md:grid-cols-2 lg:grid-cols-12"
  variants={gridVariants}
  initial={reduceMotion ? false : "hidden"}
  whileInView={reduceMotion ? undefined : "visible"}
  viewport={{ once: true, amount: 0.16 }}
>
  {games.map((game) =>
    game.featured ? (
      <SequenceGameCard key={game.id} game={game} variants={itemVariants} />
    ) : (
      <PhotoGameCard
        key={game.id}
        game={game}
        variants={itemVariants}
        reduceMotion={reduceMotion}
      />
    ),
  )}
</motion.div>
```

Keep the existing section heading, extensible copy, and “Explore all games” link unchanged.

- [ ] **Step 4: Run catalog, Sequence, and grid tests**

Run:

```powershell
node --test apps/web/src/components/home/home-games.test.mjs apps/web/src/components/home/sequence-demo-engine.test.mjs apps/web/src/components/home/sequence-game-demo.test.mjs apps/web/src/components/home/features-grid.test.mjs
```

Expected: all 10 tests pass.

- [ ] **Step 5: Commit the screenshot-led grid**

```powershell
git add apps/web/src/components/home/features-grid.tsx apps/web/src/components/home/features-grid.test.mjs
git commit -m "feat(home): add photo-driven game cards"
```

### Task 5: Add page-level reveal motion and native smooth scrolling

**Files:**
- Create: `apps/web/src/components/home/homepage-motion.test.mjs`
- Create: `apps/web/src/components/home/scroll-reveal.tsx`
- Modify: `apps/web/src/components/home/index.ts`
- Modify: `apps/web/src/app/page.tsx`
- Modify: `apps/web/src/app/globals.css`

- [ ] **Step 1: Write the page-motion contract first**

Create `homepage-motion.test.mjs`:

```js
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const globalCss = new URL("../../app/globals.css", import.meta.url);
const page = new URL("../../app/page.tsx", import.meta.url);
const webPackage = new URL("../../../package.json", import.meta.url);

test("homepage motion uses Framer Motion and keeps a reduced-motion escape hatch", async () => {
  const [css, pageSource, packageSource] = await Promise.all([
    readFile(globalCss, "utf8"),
    readFile(page, "utf8"),
    readFile(webPackage, "utf8"),
  ]);
  const packageJson = JSON.parse(packageSource);

  assert.equal(typeof packageJson.dependencies["framer-motion"], "string");
  assert.match(pageSource, /ScrollReveal/);
  assert.match(css, /html\s*\{[\s\S]*?scroll-behavior:\s*smooth/);
  assert.match(
    css,
    /prefers-reduced-motion:\s*reduce[\s\S]*?scroll-behavior:\s*auto\s*!important/,
  );
});
```

- [ ] **Step 2: Run the page-motion contract and verify it fails before integration**

Run:

```powershell
node --test apps/web/src/components/home/homepage-motion.test.mjs
```

Expected: FAIL because `page.tsx` does not use `ScrollReveal` and the root has no smooth-scroll rule.

- [ ] **Step 3: Create the reduced-motion-aware reveal wrapper**

Create `scroll-reveal.tsx`:

```tsx
"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function ScrollReveal({
  children,
  className,
  delay = 0,
}: ScrollRevealProps) {
  const reduceMotion = Boolean(useReducedMotion());

  return (
    <motion.div
      className={cn(className)}
      initial={reduceMotion ? false : { opacity: 0, y: 18 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.16 }}
      transition={{
        duration: reduceMotion ? 0 : 0.32,
        delay: reduceMotion ? 0 : delay,
        ease: "easeOut",
      }}
    >
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 4: Export and apply the wrapper to below-fold homepage sections**

Add to `apps/web/src/components/home/index.ts`:

```ts
export { ScrollReveal } from "./scroll-reveal";
```

Replace `apps/web/src/app/page.tsx` with:

```tsx
import { Navbar } from "@/components/navbar";
import {
  ArenaPromo,
  FeaturesGrid,
  Footer,
  HeroSection,
  PlayerProgress,
  ScrollReveal,
} from "@/components/home";

export default function Home() {
  return (
    <div className="min-h-dvh bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesGrid />
        <ScrollReveal>
          <PlayerProgress />
        </ScrollReveal>
        <ScrollReveal delay={0.04}>
          <ArenaPromo />
        </ScrollReveal>
      </main>
      <Footer />
    </div>
  );
}
```

- [ ] **Step 5: Enable native smooth anchor scrolling**

Add this rule at the start of `@layer base` in `globals.css`:

```css
html {
  scroll-behavior: smooth;
}
```

Keep the existing reduced-motion rule:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 6: Run the complete homepage test set**

Run:

```powershell
node --test apps/web/src/components/home/home-games.test.mjs apps/web/src/components/home/sequence-demo-engine.test.mjs apps/web/src/components/home/sequence-game-demo.test.mjs apps/web/src/components/home/features-grid.test.mjs apps/web/src/components/home/homepage-motion.test.mjs
```

Expected: all 11 tests pass.

- [ ] **Step 7: Commit page motion and smooth scrolling**

```powershell
git add apps/web/src/components/home/homepage-motion.test.mjs apps/web/src/components/home/scroll-reveal.tsx apps/web/src/components/home/index.ts apps/web/src/app/page.tsx apps/web/src/app/globals.css
git commit -m "feat(home): add restrained scroll motion"
```

### Task 6: Review, build, and verify the full experience

**Files:**
- Modify only files from Tasks 1–5 if verification reveals a scoped defect.

- [ ] **Step 1: Run the React/Next quality review on all changed TSX files**

Use the `vercel-plugin:react-best-practices` skill and inspect:

```text
apps/web/src/components/home/sequence-game-demo.tsx
apps/web/src/components/home/features-grid.tsx
apps/web/src/components/home/scroll-reveal.tsx
apps/web/src/app/page.tsx
```

Confirm focused client boundaries, timer cleanup, no unnecessary effects, optimized images, stable list keys, and no nested interactive elements. Apply only changes required by this feature.

- [ ] **Step 2: Run targeted ESLint**

Run:

```powershell
npm.cmd run lint --workspace=@mindarena/web -- src/components/home/sequence-demo-engine.ts src/components/home/sequence-game-demo.tsx src/components/home/features-grid.tsx src/components/home/scroll-reveal.tsx src/app/page.tsx
```

Expected: exit code 0.

- [ ] **Step 3: Run the production build**

Run:

```powershell
npm.cmd run build --workspace=@mindarena/web
```

Expected: Next.js production build completes successfully and `/` remains statically renderable.

- [ ] **Step 4: Verify responsive layout and routes in the browser**

Use the in-app browser against the existing local development server. Check `/` at 375 px, 768 px, 1024 px, and 1440 px. At every size confirm:

- no horizontal overflow;
- all four screenshots are recognizable and the bottom copy stays readable;
- Code Memory uses a contained image rather than a stretched crop;
- the Sequence board fits and its buttons are at least 44×44 px;
- every photo card navigates to its existing game route;
- the separate Sequence CTA navigates to `/games/sequence-memory`.

- [ ] **Step 5: Verify Sequence interaction and accessibility**

In the browser:

1. Wait for the three-cell pattern.
2. Repeat it correctly and observe the success message.
3. Wait for the automatic reset.
4. Click an incorrect cell and observe the explicit failure/retry state.
5. Complete the interaction using Tab, Enter, and Space only.
6. Confirm the status is exposed through the polite live region and focus rings remain visible.

Expected: both result paths recover automatically, controls are disabled only outside the player phase, and the full game CTA remains reachable throughout.

- [ ] **Step 6: Verify motion and reduced motion**

With normal motion, scroll through the page and confirm one-time section reveals, a short card stagger, and at most 1.03 screenshot hover zoom. Confirm the in-page Games link scrolls smoothly without scroll hijacking.

Enable `prefers-reduced-motion: reduce` and reload. Confirm reveals and hover zoom disappear, anchor scrolling becomes immediate, and Sequence still communicates the pattern through instantaneous state/contrast changes.

- [ ] **Step 7: Re-run tests after any verification fixes**

Run:

```powershell
node --test apps/web/src/components/home/home-games.test.mjs apps/web/src/components/home/sequence-demo-engine.test.mjs apps/web/src/components/home/sequence-game-demo.test.mjs apps/web/src/components/home/features-grid.test.mjs apps/web/src/components/home/homepage-motion.test.mjs
npm.cmd run lint --workspace=@mindarena/web -- src/components/home/sequence-demo-engine.ts src/components/home/sequence-game-demo.tsx src/components/home/features-grid.tsx src/components/home/scroll-reveal.tsx src/app/page.tsx
npm.cmd run build --workspace=@mindarena/web
```

Expected: 11 tests pass, targeted ESLint exits 0, and the production build succeeds.

- [ ] **Step 8: Commit verification fixes if any were required**

If verification changed files, stage only the scoped files and commit:

```powershell
git add apps/web/src/components/home apps/web/src/app/page.tsx apps/web/src/app/globals.css apps/web/package.json package-lock.json
git commit -m "fix(home): polish game card interactions"
```

If verification required no changes, do not create an empty commit.
