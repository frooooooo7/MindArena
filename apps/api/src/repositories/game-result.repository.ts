import { prisma } from "../lib/prisma";
import { GameMode, GAME_TYPE_IDS } from "@mindarena/shared";

export interface CreateGameResultData {
  userId: string;
  gameType: string;
  score: number;
  level: number;
  duration: number;
  mode: GameMode;
}

export const gameResultRepository = {
  async create(data: CreateGameResultData) {
    return prisma.gameResult.create({
      data,
    });
  },

  async findByUserId(
    userId: string,
    options?: {
      mode?: GameMode;
      limit?: number;
      offset?: number;
    }
  ) {
    return prisma.gameResult.findMany({
      where: {
        userId,
        ...(options?.mode && { mode: options.mode }),
      },
      orderBy: { createdAt: "desc" },
      take: options?.limit ?? 20,
      skip: options?.offset ?? 0,
    });
  },

  async getStats(userId: string, mode?: GameMode) {
    const aggregations = await prisma.gameResult.aggregate({
      where: {
        userId,
        ...(mode && { mode }),
      },
      _count: {
        _all: true,
      },
      _sum: {
        score: true,
        duration: true,
      },
      _max: {
        level: true,
      },
    });

    const totalGames = aggregations._count._all;
    const totalScore = aggregations._sum.score ?? 0;
    const totalPlayTime = aggregations._sum.duration ?? 0;
    const highestLevel = aggregations._max.level ?? 0;
    const averageScore = totalGames > 0 ? Math.round(totalScore / totalGames) : 0;

    return {
      totalGames,
      totalScore,
      averageScore,
      highestLevel,
      totalPlayTime,
    };
  },

  async countByUserId(userId: string, mode?: GameMode) {
    return prisma.gameResult.count({
      where: {
        userId,
        ...(mode && { mode }),
      },
    });
  },

  async getStatsByGameType(userId: string, mode?: GameMode) {
    const statsPerGame = await Promise.all(
      GAME_TYPE_IDS.map(async (gameType) => {
        const aggregations = await prisma.gameResult.aggregate({
          where: {
            userId,
            gameType,
            ...(mode && { mode }),
          },
          _count: { _all: true },
          _sum: { score: true },
          _max: { score: true, level: true },
        });

        return {
          gameType,
          totalGames: aggregations._count._all,
          totalScore: aggregations._sum.score ?? 0,
          bestScore: aggregations._max.score ?? 0,
          highestLevel: aggregations._max.level ?? 0,
        };
      })
    );

    return statsPerGame;
  },
};
