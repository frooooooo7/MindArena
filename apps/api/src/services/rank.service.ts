import { calculateRankChange, RankChangeResult } from "@mindarena/shared";
import { userRepository } from "../repositories/user.repository";

/**
 * RankService
 *
 * Handles MindRank ELO calculations and persistence.
 * This is the only service that writes rank data to the database.
 */

export interface MatchRankResult {
  winnerId: string;
  loserId: string;
  winnerRank: RankChangeResult;
  loserRank: RankChangeResult;
}

/**
 * Process rank changes for both players after a match.
 * Calculates ELO deltas, persists to DB, and returns results for socket emission.
 */
export async function processMatchRanks(
  winnerId: string,
  loserId: string,
): Promise<MatchRankResult | null> {
  try {
    // 1. Fetch current points for both players
    const [winner, loser] = await Promise.all([
      userRepository.findById(winnerId),
      userRepository.findById(loserId),
    ]);

    if (!winner || !loser) {
      console.error(
        `[RANK] Cannot process ranks: player not found (winner: ${winnerId}, loser: ${loserId})`,
      );
      return null;
    }

    // 2. Calculate rank changes using pure function from @mindarena/shared
    const winnerRank = calculateRankChange(winner.rankPoints, true);
    const loserRank = calculateRankChange(loser.rankPoints, false);

    // 3. Persist new rank data to database
    await Promise.all([
      userRepository.updateRank(
        winnerId,
        winnerRank.newPoints,
        winnerRank.newRankName,
      ),
      userRepository.updateRank(
        loserId,
        loserRank.newPoints,
        loserRank.newRankName,
      ),
    ]);

    console.log(
      `[RANK] Updated: ${winner.name} ${winnerRank.oldPoints} -> ${winnerRank.newPoints} (${winnerRank.newRankName}), ${loser.name} ${loserRank.oldPoints} -> ${loserRank.newPoints} (${loserRank.newRankName})`,
    );

    return {
      winnerId,
      loserId,
      winnerRank,
      loserRank,
    };
  } catch (error) {
    console.error("[RANK] Failed to process match ranks:", error);
    return null;
  }
}
