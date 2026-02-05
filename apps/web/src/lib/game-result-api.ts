import { api } from "./axios";
import { GameMode, GameTypeId, GameStats, GameStatsByType } from "@mindarena/shared";

// Re-export shared types for convenience
export type { GameStats, GameStatsByType, GameMode, GameTypeId };

export interface GameResult {
  id: string;
  userId: string;
  gameType: GameTypeId;
  score: number;
  level: number;
  duration: number;
  mode: GameMode;
  createdAt: string;
}

export interface SaveGameResultInput {
  gameType: GameTypeId;
  score: number;
  level: number;
  duration: number;
  mode: GameMode;
}

export interface GetHistoryResponse {
  results: GameResult[];
  total: number;
  limit: number;
  offset: number;
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
  }): Promise<GetHistoryResponse> {
    const params = new URLSearchParams();
    if (options?.mode) params.append("mode", options.mode);
    if (options?.limit) params.append("limit", options.limit.toString());
    if (options?.offset) params.append("offset", options.offset.toString());

    const response = await api.get<GetHistoryResponse>(
      `/game-results?${params.toString()}`
    );
    return response.data;
  },

  async getStats(mode?: GameMode): Promise<GameStats> {
    const params = mode ? `?mode=${mode}` : "";
    const response = await api.get<GameStats>(`/game-results/stats${params}`);
    return response.data;
  },

  async getStatsByGameType(mode?: GameMode): Promise<GameStatsByType[]> {
    const params = mode ? `?mode=${mode}` : "";
    const response = await api.get<GameStatsByType[]>(`/game-results/stats-by-game${params}`);
    return response.data;
  },
};
