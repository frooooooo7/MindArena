/**
 * Game Handlers - Re-export from modular structure
 *
 * @see ./game/index.ts - Main handler registration
 * @see ./game/timer.ts - Round timer management
 * @see ./game/sequence.handler.ts - Sequence Memory game logic
 * @see ./game/chimp.handler.ts - Chimp Memory game logic
 * @see ./game/common.ts - Shared utilities
 */
export { registerGameHandlers, clearRoundTimer } from "./game";
