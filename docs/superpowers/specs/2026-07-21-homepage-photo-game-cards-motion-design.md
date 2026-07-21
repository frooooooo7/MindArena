# Homepage photo game cards and interactive Sequence preview

Date: 2026-07-21
Status: approved direction; awaiting written-spec review

## Objective

Upgrade the featured-games section on `/` without replacing the established Game Portal theme. Four supporting cards should use real game screenshots as their main visual layer, while the featured Sequence Memory card becomes a small, playable 3×3 preview. Light, one-time Framer Motion reveals and native smooth anchor scrolling should make the page feel more polished without turning scrolling into a spectacle.

This document extends the approved homepage redesign. Where it discusses featured game cards or homepage motion, it supersedes the corresponding parts of `2026-07-21-homepage-game-portal-design.md`.

## Scope

This change includes:

- screenshot-led cards for Chimp Memory, Code Memory, Color Word, and Schulte Table;
- an animated and keyboard-playable Sequence Memory mini-preview inside the existing featured card;
- restrained Framer Motion reveals for homepage content entering the viewport;
- smooth native scrolling for in-page links;
- responsive, reduced-motion, keyboard, and screen-reader behavior;
- metadata and tests that keep the featured-games catalog extensible.

It does not change any full game route, game rules, persistence, scoring, Arena behavior, backend endpoint, or the overall homepage information architecture.

## Visual treatment of the cards

The current bento hierarchy remains: Sequence Memory occupies the large two-row card, and the four supporting games retain compact cards around it. On small screens the cards form one readable column. The redesign changes the contents of those surfaces rather than rebuilding the section layout.

Each supporting card uses its screenshot as a full-bleed background layer with a reserved aspect-ratio area, a dark tonal overlay, and a stronger bottom gradient behind the category, title, description, and CTA. The image remains recognizable, but text contrast takes priority. Borders keep the current game-specific accent color; hover and focus strengthen the border and surface separation rather than adding a new visual style.

Runtime assets are copied into `apps/web/public/game_photos/` while the user's root `game_photos/` folder remains untouched. The mapping is explicit:

| Game | Runtime image | Treatment |
| --- | --- | --- |
| Chimp Memory | `/game_photos/chimp.png` | full crop centered on the numbered board |
| Code Memory | `/game_photos/code_memory.png` | contained on a dark extension surface so the shallow source is not stretched |
| Color Word | `/game_photos/colours.png` | full crop centered on the game controls |
| Schulte Table | `/game_photos/schulte.png` | square crop centered slightly toward the top of the grid |
| Sequence Memory | no screenshot | existing 3×3 motif becomes the interactive mini-preview |

Below-the-fold screenshots use `next/image`, responsive `sizes`, and lazy loading. Their layout space is reserved before loading. Screenshots are decorative in this context because the adjacent card copy provides the accessible name and purpose, so they use empty alternative text. If an optional image field is absent from future game metadata, the card falls back to its existing CSS motif instead of rendering an empty media region.

## Sequence Memory mini-preview

The large card is an `article`, not a link wrapping the whole surface, because it contains nine interactive buttons. A separate, always-visible CTA links to `/games/sequence-memory`; this avoids nested interactive elements and keeps both the preview and full game reachable by keyboard.

The preview has a short, self-contained loop:

1. When the card enters the viewport, three cells light up one after another.
2. The status changes from “Watch the pattern” to “Your turn,” and the nine cells become enabled.
3. The player repeats the pattern by clicking, tapping, or using the keyboard.
4. A correct sequence shows a brief success state and a prompt to continue in the full game.
5. An incorrect cell shows clear error text, then replays the same preview sequence so the player can retry.
6. If there is no input after the result state, the short preview resets and loops. No score, progress, or result is saved.

The first preview sequence is deterministic, which prevents hydration differences and makes behavior reliably testable. The interaction logic is isolated from rendering as a small state engine with explicit phases: `watching`, `playing`, `success`, and `failure`. Timers are owned and cleaned up by the client component when it leaves the page.

The live status uses `aria-live="polite"`. Each cell is a real button with a descriptive label and a minimum 44×44 px target. Cells are disabled only while the pattern is being presented or the result is being shown. Success and failure are conveyed with text as well as color.

## Motion and scrolling

`framer-motion` is added to the web workspace. Motion is intentionally limited to the parts that explain hierarchy or respond to interaction:

- section content reveals once with opacity and a vertical offset of no more than 18 px;
- cards enter with a 40 ms stagger and a roughly 320 ms ease-out transition;
- supporting screenshots scale to at most `1.03` on pointer hover while the card border responds in the existing 150–300 ms rhythm;
- the Sequence cells use state-driven highlights; scale is subtle and never shifts layout;
- no parallax, scroll hijacking, continuous section movement, or animation of width, height, top, or left is introduced.

Smooth scrolling is native CSS through `scroll-behavior: smooth` on the document root. It applies to in-page anchor navigation only and does not replace browser scrolling.

When `prefers-reduced-motion: reduce` is active, section reveals, stagger, hover zoom, and smooth scrolling are disabled. The Sequence preview remains functional: its timed active-cell state changes use immediate color/contrast changes without pulsing or scale animation, so the pattern can still be understood.

## Components and data flow

The catalog metadata remains the source of truth. Supporting entries gain optional image presentation fields such as source, fit, and position. Sequence Memory remains identified by its existing motif and is rendered through the interactive preview component.

The section is split into focused units:

- `FeaturesGrid`: owns section copy, responsive bento placement, and the catalog map;
- `PhotoGameCard`: renders one linked screenshot-led supporting card and its visual fallback;
- `SequenceGameDemo`: owns timers, announcements, and the 3×3 interactive UI;
- a pure Sequence preview engine: validates player input and returns the next phase without depending on React;
- a small reusable reveal wrapper: centralizes Framer Motion viewport settings and reduced-motion behavior.

Static homepage content remains server-rendered where possible. Client boundaries are limited to motion wrappers and the Sequence interaction. No network request is added.

## Responsive behavior

- At 375 px, cards use one column, all text remains visible, and the 3×3 board fits without horizontal scrolling.
- At tablet widths, Sequence keeps visual priority and supporting cards balance image visibility with readable copy.
- At desktop widths, the existing 12-column bento proportions remain intact.
- Screenshot crops are configured per game rather than relying on one universal `object-fit` rule.
- The Code Memory image stays contained on every breakpoint to avoid pixelated enlargement and aggressive cropping.
- CTA labels remain visible without hover, and every interactive control keeps at least a 44 px hit area.

## Error handling and cleanup

- Missing optional image metadata uses the current CSS motif fallback.
- The runtime asset-presence test fails before deployment if a configured local image path does not exist.
- Sequence timers are cleared on phase change and component unmount, preventing stale updates.
- Rapid or repeated clicks outside the `playing` phase are ignored through the disabled button state.
- A failed Sequence attempt always provides a retry path; the preview never becomes stuck in a terminal state.

## Verification

- Add unit tests for correct prefixes, incorrect input, successful completion, and reset behavior in the pure Sequence engine.
- Extend the catalog test to verify unique game routes, optional image metadata, the exact screenshot mapping, and runtime asset existence.
- Run targeted web tests, ESLint for changed files, and the production build.
- Verify `/` at 375 px, 768 px, 1024 px, and a wide desktop viewport with no horizontal overflow.
- Play the Sequence preview using pointer and keyboard, including success, failure, retry, and the full-game CTA.
- Confirm every supporting card opens its existing route.
- Test visible focus, screen-reader status announcements, touch target size, and dark-surface contrast.
- Repeat the homepage check with reduced motion enabled and verify that scrolling is native, reveals do not animate, and Sequence remains understandable.

## Out of scope

- Persisted mini-game scores, levels, streaks, XP, or user history.
- Random or progressively growing Sequence rounds on the homepage.
- Replacing the screenshots with generated artwork or video.
- Applying screenshot cards to `/games` or redesigning individual game pages.
- Page transitions, parallax, custom scrollbars, or smooth-scroll JavaScript libraries.
