"use client";

import { useEffect, useState } from "react";
import { Trophy, Medal, Crown } from "lucide-react";
import { statsApi } from "@/lib/stats-api";
import { LeaderboardPlayer } from "@mindarena/shared";
import { RANK_COLORS_MAP } from "@mindarena/shared";

export function LeaderboardTable() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardPlayer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadLeaderboard() {
      try {
        const data = await statsApi.getLeaderboard(100);
        setLeaderboardData(data);
      } catch (error) {
        console.error("Failed to load leaderboard:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadLeaderboard();
  }, []);

  const getInitials = (name: string) => {
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="w-full overflow-hidden rounded-3xl border border-border/40 bg-card/60 shadow-2xl">
      <div className="p-6 border-b border-border/40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Trophy className="h-6 w-6 text-amber-500" />
          <h2 className="text-xl font-bold">Global Leaderboard</h2>
        </div>
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Top 100 Players</span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border/20 bg-secondary/10">
              <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Rank</th>
              <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Player</th>
              <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Points</th>
              <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">Games</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={`loading-${i}`} className="border-b border-border/10">
                  <td className="px-6 py-4"><div className="h-4 w-4 bg-secondary/40 rounded animate-pulse" /></td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-secondary/40 animate-pulse" />
                      <div className="h-4 w-24 bg-secondary/40 rounded animate-pulse" />
                    </div>
                  </td>
                  <td className="px-6 py-4"><div className="h-4 w-16 bg-secondary/40 rounded animate-pulse" /></td>
                  <td className="px-6 py-4 text-right"><div className="h-4 w-8 bg-secondary/40 rounded animate-pulse inline-block" /></td>
                </tr>
              ))
            ) : leaderboardData.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                  No players found. Be the first to play!
                </td>
              </tr>
            ) : (
              leaderboardData.map((player, index) => {
                const rank = index + 1;
                return (
                  <tr 
                    key={player.id} 
                    className="group border-b border-border/10 hover:bg-secondary/20 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center h-8 w-8">
                        {rank === 1 ? (
                          <Crown className="h-5 w-5 text-amber-500" />
                        ) : rank === 2 ? (
                          <Medal className="h-5 w-5 text-slate-400" />
                        ) : rank === 3 ? (
                          <Medal className="h-5 w-5 text-amber-700" />
                        ) : (
                          <span className="text-sm font-bold text-muted-foreground">{rank}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-600/20 to-indigo-600/20 flex items-center justify-center border border-violet-500/20">
                          <span className="text-[10px] font-bold text-violet-500">{getInitials(player.name)}</span>
                        </div>
                        <div className="flex flex-col">
                          <p className="text-sm font-semibold">{player.name}</p>
                          <span className={`text-[10px] uppercase font-bold tracking-wider ${RANK_COLORS_MAP[player.rankName as keyof typeof RANK_COLORS_MAP] || "text-muted-foreground"}`}>{player.rankName}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                        {player.rankPoints.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-xs font-medium text-muted-foreground">{player.totalGames} games</span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <div className="p-4 border-t border-border/20 text-center">
        <button className="text-xs font-bold text-violet-500 hover:text-indigo-500 transition-colors uppercase tracking-widest">
          View Full Rankings
        </button>
      </div>
    </div>
  );
}
