export interface LeaderboardPlayer {
  id: string;
  name: string;
  rankPoints: number;
  rankName: string;
  totalGames: number;
}

export interface StatsOverview {
  globalRank: number;
  totalActivePlayers: number;
  totalPlayers: number;
  highestLevel: number;
  averageScore: number;
}

export interface GameProgress {
  gameType: string;
  progress: number; // percentage based on something e.g count or max level
  score: number;
}
