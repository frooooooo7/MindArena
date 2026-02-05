import { api } from "./axios";

export interface GameResult {
  id: string;
  userId: string;
  gameType: "sequence" | "chimp" | "code";
  score: number;
  level: number;
  duration: number;
  mode: "local" | "arena";
  createdAt: string;
}

export interface GameStats {
  totalGames: number;
  totalScore: number;
  averageScore: number;
  highestLevel: number;
  totalPlayTime: number;
}

export interface SaveGameResultInput {
  gameType: "sequence" | "chimp" | "code";
  score: number;
  level: number;
  duration: number;
  mode: "local" | "arena";
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
    mode?: "local" | "arena";
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

  async getStats(mode?: "local" | "arena"): Promise<GameStats> {
    const params = mode ? `?mode=${mode}` : "";
    const response = await api.get<GameStats>(`/game-results/stats${params}`);
    return response.data;
  },
};
