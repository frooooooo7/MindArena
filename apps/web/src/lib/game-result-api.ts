import { api } from "./axios";
import {
  GameMode,
  GameTypeId,
  GameStats,
  GameStatsByType,
  GameResult,
  GetHistoryResponse,
} from "@mindarena/shared";

// Re-export shared types for convenience
export type {
  GameStats,
  GameStatsByType,
  GameMode,
  GameTypeId,
  GameResult,
  GetHistoryResponse,
};

export interface SaveGameResultInput {
  gameType: GameTypeId;
  score: number;
  level: number;
  duration: number;
  mode: GameMode;
}

export const gameResultApi = {
  async save(data: SaveGameResultInput): Promise<GameResult> {
    const response = await api.post<GameResult>("/game-results", data);
    return response.data;
  },

  async getHistory(options?: {
    mode?: GameMode;
    limit?: number;
    offset?: number;
    userName?: string;
  }): Promise<GetHistoryResponse> {
    const params = new URLSearchParams();
    if (options?.mode) params.append("mode", options.mode);
    if (options?.limit) params.append("limit", options.limit.toString());
    if (options?.offset) params.append("offset", options.offset.toString());
    if (options?.userName) params.append("userName", options.userName);

    const response = await api.get<GetHistoryResponse>(
      `/game-results?${params.toString()}`,
    );
    return response.data;
  },

  async getStats(mode?: GameMode, userName?: string): Promise<GameStats> {
    const params = new URLSearchParams();
    if (mode) params.append("mode", mode);
    if (userName) params.append("userName", userName);
    const query = params.toString();
    const response = await api.get<GameStats>(
      `/game-results/stats${query ? `?${query}` : ""}`,
    );
    return response.data;
  },

  async getStatsByGameType(
    mode?: GameMode,
    userName?: string,
  ): Promise<GameStatsByType[]> {
    const params = new URLSearchParams();
    if (mode) params.append("mode", mode);
    if (userName) params.append("userName", userName);
    const query = params.toString();
    const response = await api.get<GameStatsByType[]>(
      `/game-results/stats-by-game${query ? `?${query}` : ""}`,
    );
    return response.data;
  },
};
