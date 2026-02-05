import { GameTypeId } from "../types/game";

/**
 * Shared scoring logic for all games
 */
export const scoring = {
  /**
   * Calculate score for a game based on type and level reached
   */
  calculateScore(gameType: string | GameTypeId, level: number): number {
    const type = gameType.toLowerCase();

    switch (type) {
      case "chimp":
        // Chimp: level * 150 points 
        // Level 1 (4 numbers) = 150
        // Level 2 (5 numbers) = 300
        return level * 150;

      case "sequence":
        // Sequence: sum of points for each level reached
        // level 1: 10, level 2: 20, level 3: 30...
        // Formula: level * (level + 1) * 5
        return (level * (level + 1)) * 5;

      case "code":
        // Code: level * 200
        return level * 200;

      default:
        // Default fallback
        return level * 100;
    }
  }
};
