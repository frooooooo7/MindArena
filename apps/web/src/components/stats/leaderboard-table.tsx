"use client";

import { Trophy, Medal, Crown } from "lucide-react";

const leaderboardData = [
  { rank: 1, name: "Alex Rivers", score: 145200, games: 452, avatar: "AR", trend: "up" },
  { rank: 2, name: "Sarah Connor", score: 138900, games: 382, avatar: "SC", trend: "up" },
  { rank: 3, name: "John Doe", score: 124500, games: 512, avatar: "JD", trend: "down" },
  { rank: 4, name: "Emma Watson", score: 112000, games: 290, avatar: "EW", trend: "up" },
  { rank: 5, name: "Leo Das", score: 98000, games: 215, avatar: "LD", trend: "stable" },
  { rank: 6, name: "Mia Wong", score: 85400, games: 180, avatar: "MW", trend: "up" },
  { rank: 7, name: "Chris Evans", score: 72100, games: 150, avatar: "CE", trend: "down" },
];

export function LeaderboardTable() {
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
              <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Score</th>
              <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">Games</th>
            </tr>
          </thead>
          <tbody>
            {leaderboardData.map((player) => (
              <tr 
                key={player.rank} 
                className="group border-b border-border/10 hover:bg-secondary/20 transition-colors cursor-pointer"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center h-8 w-8">
                    {player.rank === 1 ? (
                      <Crown className="h-5 w-5 text-amber-500" />
                    ) : player.rank === 2 ? (
                      <Medal className="h-5 w-5 text-slate-400" />
                    ) : player.rank === 3 ? (
                      <Medal className="h-5 w-5 text-amber-700" />
                    ) : (
                      <span className="text-sm font-bold text-muted-foreground">{player.rank}</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-600/20 to-indigo-600/20 flex items-center justify-center border border-violet-500/20">
                      <span className="text-[10px] font-bold text-violet-500">{player.avatar}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{player.name}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                    {player.score.toLocaleString()}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-xs font-medium text-muted-foreground">{player.games} games</span>
                </td>
              </tr>
            ))}
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
