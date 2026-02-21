import { userRepository } from "../repositories/user.repository";
import { gameResultRepository } from "../repositories/game-result.repository";
import { LeaderboardPlayer, StatsOverview } from "@mindarena/shared";

export const statsService = {
  async getLeaderboard(limit = 100): Promise<LeaderboardPlayer[]> {
    const topPlayers = await userRepository.getLeaderboard(limit);

    return topPlayers.map(player => ({
      id: player.id,
      name: player.name,
      rankPoints: player.rankPoints,
      rankName: player.rankName,
      totalGames: player._count.gameResults,
    }));
  },

  async getOverview(userId: string): Promise<StatsOverview> {
    const [globalRank, totalActivePlayers, totalPlayers, globalStats] = await Promise.all([
      userRepository.getPlayerRank(userId),
      userRepository.getTotalActivePlayers(),
      userRepository.getTotalPlayers(),
      gameResultRepository.getGlobalStats(),
    ]);

    return {
      globalRank: globalRank || 0,
      totalActivePlayers,
      totalPlayers,
      highestLevel: globalStats.highestLevel,
      averageScore: globalStats.averageScore,
    };
  }
};
