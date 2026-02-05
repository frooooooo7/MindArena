import {
  gameResultRepository,
  CreateGameResultData,
} from "../repositories/game-result.repository";

export interface SaveGameResultInput {
  userId: string;
  gameType: string;
  score: number;
  level: number;
  duration: number;
  mode: "local" | "arena";
}

export interface GetHistoryInput {
  userId: string;
  mode?: "local" | "arena";
  limit?: number;
  offset?: number;
}

export const gameResultService = {
  async saveResult(input: SaveGameResultInput) {
    const data: CreateGameResultData = {
      userId: input.userId,
      gameType: input.gameType,
      score: input.score,
      level: input.level,
      duration: input.duration,
      mode: input.mode,
    };

    return gameResultRepository.create(data);
  },

  async getHistory(input: GetHistoryInput) {
    const [results, total] = await Promise.all([
      gameResultRepository.findByUserId(input.userId, {
        mode: input.mode,
        limit: input.limit,
        offset: input.offset,
      }),
      gameResultRepository.countByUserId(input.userId, input.mode),
    ]);

    return { results, total };
  },

  async getStats(userId: string, mode?: "local" | "arena") {
    return gameResultRepository.getStats(userId, mode);
  },
};
