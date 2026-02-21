import { api } from "./axios";
import { LeaderboardPlayer, StatsOverview } from "@mindarena/shared";

export const statsApi = {
  async getLeaderboard(limit = 100): Promise<LeaderboardPlayer[]> {
    const response = await api.get<LeaderboardPlayer[]>(`/stats/leaderboard?limit=${limit}`);
    return response.data;
  },

  async getOverview(): Promise<StatsOverview> {
    const response = await api.get<StatsOverview>("/stats/overview");
    return response.data;
  }
};
