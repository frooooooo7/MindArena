"use client";

import { useEffect, useState } from "react";
import { Target, TrendingUp, Users } from "lucide-react";
import { statsApi } from "@/lib/stats-api";
import { StatsOverview } from "@mindarena/shared";

export function RankCard() {
  const [overview, setOverview] = useState<StatsOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadOverview() {
      try {
        const data = await statsApi.getOverview();
        setOverview(data);
      } catch (error) {
        console.error("Failed to load overview data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadOverview();
  }, []);

  const getPercentile = (rank: number, total: number) => {
    if (!rank || !total || total === 0) return 100;
    const percentile = (rank / total) * 100;
    return percentile < 1 ? percentile.toFixed(2) : percentile.toFixed(1);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="p-6 rounded-3xl border border-border/40 bg-gradient-to-br from-violet-600 to-indigo-700 text-white shadow-2xl shadow-violet-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 h-32 w-32 bg-white/10 rounded-full pointer-events-none" />
        
        <div className="relative flex items-center justify-between mb-6">
          <div className="p-2 rounded-xl bg-white/20">
            <Target className="h-6 w-6" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Global Rank</span>
        </div>
        
        <div className="relative">
          {isLoading ? (
            <div className="h-10 w-32 bg-white/20 rounded animate-pulse" />
          ) : (
            <>
              <p className="text-4xl font-black italic">#{overview?.globalRank?.toLocaleString() || "-"}</p>
              <div className="flex items-center gap-2 mt-2">
                {overview?.globalRank && overview?.totalPlayers && (
                  <span className="text-[10px] font-medium opacity-80 italic">Top {getPercentile(overview.globalRank, overview.totalPlayers)}%</span>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="p-6 rounded-3xl border border-border/40 bg-card/60 shadow-xl hover:border-violet-500/40 transition-colors duration-200">
        <div className="flex items-center justify-between mb-6">
          <div className="p-2 rounded-xl bg-violet-600/10 text-violet-600">
            <Users className="h-6 w-6" />
          </div>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Active Players</span>
        </div>
        
        <div>
          {isLoading ? (
            <div className="h-10 w-24 bg-secondary/40 rounded animate-pulse mb-2" />
          ) : (
            <p className="text-4xl font-bold tracking-tight">{overview?.totalActivePlayers?.toLocaleString() || "0"}</p>
          )}
          <p className="text-xs text-muted-foreground mt-2 font-medium">Currently competing in arena</p>
        </div>
      </div>

      <div className="p-6 rounded-3xl border border-border/40 bg-card/60 shadow-xl hover:border-emerald-500/40 transition-colors duration-200">
        <div className="flex items-center justify-between mb-6">
          <div className="p-2 rounded-xl bg-emerald-600/10 text-emerald-600">
            <TrendingUp className="h-6 w-6" />
          </div>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Global Stats</span>
        </div>
        
        <div>
          {isLoading ? (
            <div className="h-10 w-24 bg-secondary/40 rounded animate-pulse mb-2" />
          ) : (
            <p className="text-4xl font-bold tracking-tight text-emerald-600">Lvl {overview?.highestLevel || 0}</p>
          )}
          <p className="text-xs text-muted-foreground mt-2 font-medium">Highest level reached globally</p>
        </div>
      </div>
    </div>
  );
}
