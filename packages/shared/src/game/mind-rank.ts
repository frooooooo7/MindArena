/**
 * MindRank System - ELO-based ranking for MindArena
 *
 * Pure functions for calculating rank points and determining rank tiers.
 * This is the Single Source of Truth for all ranking logic.
 */

// ============================================
// RANK TIERS & THRESHOLDS (Hardcoded)
// ============================================

export const RANK_TIERS = [
  { name: "Neuron", minPoints: 0, icon: "🧠" },
  { name: "Synapsa", minPoints: 100, icon: "⚡" },
  { name: "Kora", minPoints: 300, icon: "🌀" },
  { name: "Geniusz", minPoints: 600, icon: "🏆" },
] as const;

export type RankName = (typeof RANK_TIERS)[number]["name"];

export interface RankTier {
  name: RankName;
  minPoints: number;
  icon: string;
}

/** Visual mapping for rank colors across the application */
export const RANK_COLORS_MAP: Record<RankName, string> = {
  Neuron: "text-cyan-400",
  Synapsa: "text-blue-400",
  Kora: "text-violet-400",
  Geniusz: "text-amber-400",
};

// ============================================
// ELO CONSTANTS
// ============================================

/** Points gained/lost per match */
export const RANK_POINTS_PER_MATCH = 8;

/** Minimum rank points (floor) */
export const MIN_RANK_POINTS = 0;

// ============================================
// RANK CALCULATION (Pure Functions)
// ============================================

export interface RankChangeResult {
  /** Points before the match */
  oldPoints: number;
  /** Points after the match */
  newPoints: number;
  /** Points gained or lost (positive = gain, negative = loss) */
  pointsDelta: number;
  /** Rank name before the match */
  oldRankName: RankName;
  /** Rank name after the match */
  newRankName: RankName;
  /** Rank icon after the match */
  newRankIcon: string;
  /** Whether the player advanced to a higher rank */
  isPromotion: boolean;
  /** Whether the player dropped to a lower rank */
  isDemotion: boolean;
}

/**
 * Determine the rank tier for a given point total.
 * Iterates tiers in reverse to find the highest qualifying tier.
 */
export function getRankForPoints(points: number): RankTier {
  for (let i = RANK_TIERS.length - 1; i >= 0; i--) {
    if (points >= RANK_TIERS[i].minPoints) {
      return { ...RANK_TIERS[i] };
    }
  }
  // Fallback (should never happen since Neuron starts at 0)
  return { ...RANK_TIERS[0] };
}

/**
 * Calculate the rank change after a match.
 *
 * @param currentPoints - The player's current rank points
 * @param isWinner - Whether the player won the match
 * @returns A RankChangeResult with all the details
 */
export function calculateRankChange(
  currentPoints: number,
  isWinner: boolean,
): RankChangeResult {
  const oldRank = getRankForPoints(currentPoints);
  const delta = isWinner ? RANK_POINTS_PER_MATCH : -RANK_POINTS_PER_MATCH;
  const newPoints = Math.max(MIN_RANK_POINTS, currentPoints + delta);
  const newRank = getRankForPoints(newPoints);

  return {
    oldPoints: currentPoints,
    newPoints,
    pointsDelta: newPoints - currentPoints,
    oldRankName: oldRank.name,
    newRankName: newRank.name,
    newRankIcon: newRank.icon,
    isPromotion: RANK_TIERS.findIndex((t) => t.name === newRank.name) >
      RANK_TIERS.findIndex((t) => t.name === oldRank.name),
    isDemotion: RANK_TIERS.findIndex((t) => t.name === newRank.name) <
      RANK_TIERS.findIndex((t) => t.name === oldRank.name),
  };
}

/**
 * Get the next rank tier above the current one, or null if already at max.
 */
export function getNextRankTier(currentRankName: RankName): RankTier | null {
  const currentIndex = RANK_TIERS.findIndex((t) => t.name === currentRankName);
  if (currentIndex < 0 || currentIndex >= RANK_TIERS.length - 1) return null;
  return { ...RANK_TIERS[currentIndex + 1] };
}

/**
 * Calculate progress percentage towards the next rank.
 * Returns 100 if already at the highest rank.
 */
export function getRankProgress(points: number): number {
  const currentRank = getRankForPoints(points);
  const nextRank = getNextRankTier(currentRank.name);

  if (!nextRank) return 100; // Already at max rank

  const pointsInCurrentTier = points - currentRank.minPoints;
  const tierRange = nextRank.minPoints - currentRank.minPoints;

  return Math.min(100, Math.round((pointsInCurrentTier / tierRange) * 100));
}
