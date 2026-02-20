"use client";

import { Swords, Zap, TrendingUp } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { getRankForPoints, getRankProgress, getNextRankTier, RankName } from "@mindarena/shared";

export function ArenaHeader() {
  const user = useAuthStore((s) => s.user);

  const rank = user ? getRankForPoints(user.rankPoints) : null;
  const progress = user ? getRankProgress(user.rankPoints) : 0;
  const nextRank = rank ? getNextRankTier(rank.name as RankName) : null;

  return (
    <div className="relative p-8 md:p-12 rounded-[2.5rem] overflow-hidden border border-violet-500/20 bg-gradient-to-br from-violet-900/50 to-indigo-900/50 shadow-2xl">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 h-96 w-96 bg-violet-600/15 rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 h-64 w-64 bg-indigo-600/15 rounded-full pointer-events-none" />
      
      <div className="relative flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
        <div className="space-y-4 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-bold uppercase tracking-widest">
            <Zap className="h-3 w-3 fill-current" />
            Season 4: Cognitive Rise
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white italic uppercase">
            The <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">Arena</span>
          </h1>
          <p className="text-lg text-violet-200/60 font-medium">
            Test your cognitive limits against the world. Climb the ranks, earn legendary status, and claim your place among the elite.
          </p>
        </div>

        {/* Rank Card (logged in) or Season Timer (guest) */}
        {user && rank ? (
          <div className="flex flex-col items-center gap-4 bg-white/5 p-6 rounded-3xl border border-white/10 min-w-[240px]">
            <div className="flex items-center gap-2 text-violet-300 text-sm font-bold uppercase tracking-tighter">
              <Swords className="h-4 w-4" />
              Your Rank
            </div>

            {/* Rank Icon & Name */}
            <div className="flex flex-col items-center gap-1">
              <span className="text-5xl">{rank.icon}</span>
              <span className="text-xl font-black text-white uppercase tracking-tight">
                {rank.name}
              </span>
              <span className="text-sm font-semibold text-violet-300/70 tabular-nums">
                {user.rankPoints} points
              </span>
            </div>

            {/* Progress to next rank */}
            {nextRank && (
              <div className="w-full space-y-1.5">
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-400 transition-all duration-700"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] uppercase font-bold text-violet-400/60">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    Next: {nextRank.icon} {nextRank.name}
                  </span>
                  <span>{nextRank.minPoints} pts</span>
                </div>
              </div>
            )}

            {!nextRank && (
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider animate-pulse">
                ✦ Maximum Rank ✦
              </span>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 bg-white/5 p-6 rounded-3xl border border-white/10 min-w-[240px]">
            <div className="flex items-center gap-2 text-violet-300 text-sm font-bold uppercase tracking-tighter">
              <Swords className="h-4 w-4" />
              MindRank
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-4xl">🧠</span>
              <span className="text-sm font-semibold text-violet-200/60">
                Sign in to track your rank
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
