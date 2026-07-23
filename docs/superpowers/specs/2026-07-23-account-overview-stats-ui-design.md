# Account Overview Stats UI Redesign

**Date:** 2026-07-23  
**Scope:** `/account` Overview — Personal Practice / Friend Duels mode toggle + stats presentation  
**Out of scope:** Main tabs (Overview / Statistics / Social / Security), history lists below stats, data API changes

## Goal

Make mode switching between Personal Practice and Friend Duels feel smooth, and replace the flat 4 equal stat cards with a more interesting bento layout that fits MindArena’s dark + mint aesthetic.

## Decisions (approved)

| Topic | Choice |
|-------|--------|
| Stats layout | Bento / highlight (large hero metric + smaller secondary metrics) |
| Mode transition | Sliding pill on toggle + content crossfade |
| Implementation | Shared `StatsBento` + Framer Motion (`AnimatePresence`) |

## Layout

### Personal Practice bento

| Slot | Metric |
|------|--------|
| Hero (large) | Total Score |
| Secondary | Games Played |
| Secondary | Average Round Score |
| Secondary | Highest Level Reached |

### Friend Duels bento

| Slot | Metric |
|------|--------|
| Hero (large) | Win Rate % |
| Secondary | Total Duels |
| Secondary | Duels Won |
| Secondary | Duels Lost |

### Responsive

- **Desktop / `lg+`:** Hero on the left (~40% width, full height of the bento). Three secondary tiles stacked or arranged in a compact column/grid on the right.
- **Mobile:** Hero full-width on top; three secondary tiles below (stack or 3-column when space allows).
- Same grid skeleton for both modes so crossfade does not reflow wildly.

### Visual language

- Keep existing dark glass: `bg-white/[0.02]`, `border-white/10`, `backdrop-blur`, mint accent (`portal-mint`).
- Hero tile gets a subtle radial mint wash; secondary tiles stay quieter.
- Icons remain Lucide, mint-outlined treatments consistent with current account UI.
- No equal 4-column card grid for these overview stats.

## Mode toggle & motion

1. **Toggle control** (Overview only): Keep Personal Practice / Friend Duels controls. Active state is a Framer Motion sliding pill (`layoutId`) moving between options (~250ms, eased).
2. **Content swap:** Wrap the active section (`LocalStatsSection` / `FriendStatsSection` or their bento + below content) in `AnimatePresence` with `mode="wait"`:
   - Exit: fade + slight scale-down (~150ms)
   - Enter: fade + slight scale-up (~200ms)
3. **Numbers:** Optional short count-up when a mode’s bento mounts and value &gt; 0. If `prefers-reduced-motion: reduce`, show final values immediately and skip pill/content motion (instant swap / static pill).
4. **Main account tabs** unchanged (no animation work in this change).

## Components

| Piece | Role |
|-------|------|
| `StatsBento` (new) | Presentational bento: accepts hero + secondary metric configs (label, value, subtext, icon). Used by both modes. |
| `StatsOverview` | Refactor to render `StatsBento` for local practice metrics (or thin wrapper). |
| `FriendStatsSection` | Replace inline 4-card grid with `StatsBento` (win-rate hero). History list stays as-is below. |
| Mode toggle | Enhance in `account-page-content.tsx` (or extract small `ModeToggle`) with sliding pill + wrap mode content in `AnimatePresence`. |

No API / data-shape changes. Reuse existing `GameStats` and duel-derived win/loss numbers.

## Loading & error

- Loading: skeleton that mirrors the bento grid (one tall hero + three smaller blocks), not four equal cards.
- Error: keep existing error panels / retry; no redesign required.
- Empty zeros (new accounts): still show bento with `0` / `Level 0` / `0%` — layout stays interesting even without data.

## Success criteria

- Switching Personal Practice ↔ Friend Duels feels continuous (pill slides, content fades) rather than an instant hard cut.
- Overview stats read as a cohesive “game profile” panel, not four identical dashboard tiles.
- Motion respects `prefers-reduced-motion`.
- Existing history / top-discipline sections under each mode still work unchanged.
