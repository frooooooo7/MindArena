# MindArena Game Portal homepage redesign

Date: 2026-07-21  
Status: approved visual direction

## Objective

Redesign `/` as the first implementation of a new dark MindArena identity. The page should explain the product quickly, make the game library the main attraction, and let a visitor enter a game with minimal friction. Arena remains a strong secondary benefit rather than the primary entry point.

The visual language targets teenagers and young adult players. It should feel energetic, modern, and competitive without using the familiar AI/SaaS formula of blurred gradient blobs, a pill badge, a generic centered headline, and four interchangeable feature cards.

## Scope

This phase includes:

- a complete redesign of `/`;
- a redesigned shared navbar and homepage footer;
- global dark-first design tokens for color, typography, radius, elevation, focus, and motion;
- reusable homepage components for the hero game preview, featured games, player progress, and Arena promotion;
- responsive, accessible behavior for mobile and desktop.

Other routes will keep their current information architecture and functionality. They may inherit base tokens, but their full visual migration is intentionally deferred to later phases.

## Product message

The homepage must not describe MindArena as a fixed collection of five games. It presents a growing library of short memory, attention, and speed challenges. Copy should use phrases such as “growing collection,” “discover another challenge,” and “new games over time.”

The five games currently available can be shown as featured entries, but no heading, progress indicator, or CTA may imply that five is the permanent total. Daily progress counts rounds or completed challenges, not a percentage of the entire catalog.

## Visual direction: Game Portal

The selected direction treats an interactive-looking game preview as the hero object. The page combines:

- the energy and short copy of a youth sports campaign;
- a large, dimensional game surface that demonstrates the product immediately;
- restrained 3D depth through layered panels, perspective, and floating score feedback;
- bright accents used for state and reward rather than decorative gradients everywhere.

### Global foundations

- **Primary background:** deep navy-black (`#090D19`).
- **Raised surface:** blue-black (`#0D1120`) with a lighter interactive surface around `#151A31`.
- **Primary accent:** electric mint (`#70F5C1`) for active states, important labels, and quick-play actions.
- **Secondary accent:** ultraviolet (`#755CFF`) for the main hero CTA and dimensional glow.
- **Reward accents:** yellow (`#FFD54A`) and pink (`#FF5E94`) for score, combo, XP, and competitive feedback.
- **Text:** near-white primary text and blue-gray secondary text with WCAG AA contrast.
- **Typography:** Space Grotesk for campaign headlines, Geist for body and UI, and Geist Mono with tabular figures for scores and timers.
- **Shape:** rounded but controlled; large portal panels use 24–28 px radii, normal cards 16–20 px, and actions use pill geometry only when it conveys a compact control.
- **Elevation:** borders and dark tonal separation establish most hierarchy. Colored glow is reserved for active game cells, CTA focus, and score feedback.

Dark mode is the default brand experience. Existing theme support remains available, but this phase treats the dark theme as the reference implementation.

## Homepage structure

### 1. Navigation

The navbar contains the MindArena wordmark, Games, Arena, and Ranking. The right side shows Sign in plus one clear Quick Play action for guests, or the existing account control for authenticated users. Mobile uses one labelled menu control with a minimum 44 px target and a clear expanded state.

### 2. Hero portal

The hero gives a short explanation and one primary CTA: choose a game. A large Sequence Memory-inspired preview sits below the copy and looks active through highlighted cells, a timer, level label, combo, and XP feedback. It is a visual product demonstration, not an embedded playable game in this phase.

The copy avoids a fixed game count. Suggested structure:

- eyebrow: “Growing collection · no installation · instant score”;
- headline: “Enter. Play. Beat your score.”;
- body: short memory games that start quickly and reward another attempt;
- CTA: “Choose your first game.”

### 3. Featured games

This is the most important content section. It presents the current library using one larger featured card and a responsive set of supporting cards. Each card contains the game name, a one-sentence mechanic, a small visual motif derived from that game, and a direct Play action.

Cards are driven by a data array rather than hard-coded one-off markup. Adding another game should require adding a data item, not restructuring the section. The section includes a route to the full `/games` catalog when the number of games exceeds the featured set.

### 4. Progress teaser

Authenticated users see values that already exist in the product: total score, games played, and MindRank. The component may use the existing game-result stats endpoint after auth hydration and the rank stored on the user. Guests see benefit-oriented labels and a sign-in prompt without fabricated personal statistics. The strip renders a fixed-height skeleton while authenticated statistics load, then falls back to the guest variant plus a retry link if the optional request fails.

### 5. Arena promotion

A visually distinct versus panel introduces live competition after the user has already seen the games. It explains the Arena in one sentence and links to Arena modes. Yellow and pink accents differentiate competition from the mint game-discovery path.

### 6. Footer

The footer repeats the wordmark and a small set of useful navigation links. It does not repeat a large marketing pitch.

## Components and data flow

The route remains a server-rendered page where possible. Static sections receive plain configuration data. Only components that read authentication state or support interactive navigation require client boundaries.

Proposed units:

- redesigned shared `Navbar`: global navigation and auth-aware actions;
- `GamePortalHero`: campaign copy and decorative game preview;
- `FeaturedGames`: responsive rendering of extensible game metadata;
- `GamePreviewCard`: a single game’s content, visual motif, and link;
- `PlayerProgress`: guest/authenticated variants;
- `ArenaPromo`: secondary competitive CTA;
- `HomeFooter`: compact closing navigation.

Game metadata should include at least slug, title, short description, category, accent, and optional featured status. All links use existing routes and do not introduce new backend endpoints.

## Interaction and motion

- Use 150–300 ms transitions on opacity and transform only.
- The hero preview may use one subtle sequence highlight loop and floating feedback entrance; it must stop or simplify under `prefers-reduced-motion`.
- Game cards may lift by a few pixels and reveal the Play affordance on pointer hover, while keeping the same action visible on touch devices.
- Focus states must be at least 2 px and remain visible against every accent color.
- Decorative panels must not block links or appear in the screen-reader tree.

## Responsive behavior

- The hero headline and preview scale down without horizontal scrolling at 375 px.
- The preview stays legible but simplifies its grid and floating chips on small screens.
- Featured games become a single-column list on small screens; no card relies on hover to expose its CTA.
- Progress metrics stack vertically when needed.
- The Arena panel changes from split layout to copy above the versus visual.
- Section spacing follows an 8 px rhythm, with smaller mobile gutters and a consistent desktop max width.

## Accessibility and quality

- Body text and controls meet WCAG AA contrast; accent text is tested on its actual surface.
- Every interactive target is at least 44 × 44 px.
- Heading levels follow document order and there is one page `h1`.
- Icon-only controls have accessible names; decorative game cells are hidden from assistive technology.
- Keyboard users can reach every navigation and game action in visual order.
- The page reserves space for auth-dependent content to avoid layout shift.

## Error and empty states

The homepage renders its core content without a remote fetch. After auth hydration, the progress teaser may request existing game-result statistics. If auth hydration or that optional request fails, the page stays usable and shows the guest benefits with a retry link for stats. If featured game metadata is empty, the section shows a concise message and a link to `/games` rather than an empty grid. Missing optional game artwork falls back to a CSS motif based on the game accent.

## Verification

- Run lint and a production build for `apps/web`.
- Verify `/` at 375 px, 768 px, 1024 px, and a wide desktop viewport.
- Check guest and authenticated navbar/progress variants.
- Navigate every game card and both primary/secondary CTAs.
- Test keyboard navigation, visible focus, reduced motion, and dark-theme contrast.
- Confirm that adding a sixth metadata entry produces a valid responsive card without layout changes.

## Out of scope

- Redesigning the internal layout of game routes, Account, Stats, or Arena.
- Adding new games, achievements, XP persistence, or backend progress APIs.
- Turning the hero preview into a fully playable game.
- Replacing existing authentication or matchmaking behavior.
