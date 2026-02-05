/**
 * Game-related constants and types used across the application.
 */

// Game Types
export const GAME_TYPE_IDS = ["sequence", "chimp", "code"] as const;
export type GameTypeId = (typeof GAME_TYPE_IDS)[number];

// Game Modes
export const GAME_MODES = ["local", "arena"] as const;
export type GameMode = (typeof GAME_MODES)[number];

// Game Result Stats (per game type)
export interface GameStatsByType {
  gameType: GameTypeId;
  totalGames: number;
  totalScore: number;
  bestScore: number;
  highestLevel: number;
}

// Aggregate Stats (overall)
export interface GameStats {
  totalGames: number;
  totalScore: number;
  averageScore: number;
  highestLevel: number;
  totalPlayTime: number;
}
