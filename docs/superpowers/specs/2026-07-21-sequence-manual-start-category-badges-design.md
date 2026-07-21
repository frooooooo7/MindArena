# Sequence Preview Manual Start and Category Badges Design

## Goal

Prevent the Sequence Memory preview on the homepage from starting when it enters the viewport, and make every game-category label readable over dark gradients and screenshots.

## Interaction design

- The preview initially shows a quiet `Ready when you are` state.
- Scrolling the card into or out of view never changes game state and never creates sequence timers.
- A visible, keyboard-accessible `Start sequence` button is the only way to begin the three-tile preview.
- After success or failure, the board remains in the result state and exposes `Play again`; it does not restart automatically.
- The full-game link remains available independently of the preview state.
- Board cells remain disabled until the preview finishes showing the pattern.
- Reduced-motion mode keeps the timed tile highlights but removes transform feedback.

## Visual design

- Category names use compact pill badges rather than small unbacked text.
- Every badge gets a near-black translucent surface, a tone-matched border, a brighter tone-matched foreground, and a subtle backdrop blur.
- The treatment is shared by the featured Sequence Memory card and all photo cards.
- Badge text remains uppercase but receives slightly larger type and less extreme tracking for legibility.

## Accessibility

- The start/replay action uses a native button with a minimum 44px target and a visible focus state.
- Status changes remain exposed through the existing polite live region.
- Category text targets WCAG AA contrast against its badge surface rather than relying on the underlying image.

## Verification

- Component behavior tests cover idle state, explicit start, disabled/enabled board state, terminal results, manual replay, timer cleanup, and reduced motion.
- The existing homepage data tests and production build run once after implementation.
