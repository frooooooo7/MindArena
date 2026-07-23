"use client";

import { useEffect, useState } from "react";
import { Target, TrendingUp, Users, Zap, Shield, Sparkles, Award } from "lucide-react";
import { statsApi } from "@/lib/stats-api";
import { StatsOverview, getRankForPoints, getNextRankTier, getRankProgress } from "@mindarena/shared";
import { motion } from "framer-motion";

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

  const points = overview?.averageScore ? Math.round(overview.averageScore * 10) : 150;
  const currentRank = getRankForPoints(points);
  const nextRank = getNextRankTier(currentRank.name);
  const progressPercent = getRankProgress(points);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
      {/* Card 1: Player Rank & Progress */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="p-6 rounded-3xl border border-portal-violet/40 bg-gradient-to-br from-[#1b153a] via-[#14122b] to-[#0d1120] text-foreground shadow-xl shadow-portal-violet/10 relative overflow-hidden flex flex-col justify-between group"
      >
        <div className="portal-dot-grid absolute inset-0 opacity-30 pointer-events-none" />
        <div className="absolute top-0 right-0 h-32 w-32 bg-portal-violet/10 rounded-full blur-2xl pointer-events-none group-hover:bg-portal-violet/20 transition-all duration-300" />

        <div>
          <div className="relative flex items-center justify-between mb-4">
            <div className="p-2.5 rounded-2xl bg-portal-violet/20 border border-portal-violet/30 text-portal-violet flex items-center gap-2">
              <span className="text-lg">{currentRank.icon}</span>
              <span className="font-display font-extrabold text-xs uppercase tracking-wider text-white">
                {currentRank.name}
              </span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-portal-violet/80 bg-portal-violet/10 px-2.5 py-1 rounded-full border border-portal-violet/20">
              Rank Division
            </span>
          </div>

          <div className="relative my-2">
            {isLoading ? (
              <div className="h-10 w-36 bg-secondary/40 rounded-xl animate-pulse" />
            ) : (
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-3xl font-black tracking-tight text-white">
                    {points.toLocaleString()}
                  </span>
                  <span className="text-xs font-bold text-portal-violet">PTS</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Current rating in MindRank ELO system
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Tier Progress Bar */}
        <div className="mt-4 pt-4 border-t border-white/10 relative z-10">
          <div className="flex items-center justify-between text-xs font-bold mb-1.5">
            <span className="text-muted-foreground flex items-center gap-1 text-[11px]">
              <Zap className="h-3.5 w-3.5 text-portal-yellow" />
              {nextRank ? `Next Tier: ${nextRank.name}` : "Max Rank Achieved"}
            </span>
            <span className="text-portal-mint text-[11px] font-mono">{progressPercent}%</span>
          </div>
          <div className="h-2 w-full bg-secondary/60 rounded-full overflow-hidden p-0.5 border border-white/5">
            <div
              className="h-full bg-gradient-to-r from-portal-violet via-portal-blue to-portal-mint rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </motion.div>

      {/* Card 2: Global Standing & Percentile */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="p-6 rounded-3xl border border-portal-mint/30 bg-gradient-to-br from-[#0c1f19] via-[#0d161d] to-[#0d1120] text-foreground shadow-xl shadow-portal-mint/5 relative overflow-hidden flex flex-col justify-between group"
      >
        <div className="portal-dot-grid absolute inset-0 opacity-20 pointer-events-none" />
        <div className="absolute top-0 right-0 h-32 w-32 bg-portal-mint/10 rounded-full blur-2xl pointer-events-none group-hover:bg-portal-mint/20 transition-all duration-300" />

        <div className="relative flex items-center justify-between mb-4">
          <div className="p-2.5 rounded-2xl bg-portal-mint/15 border border-portal-mint/30 text-portal-mint">
            <Target className="h-5 w-5" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-portal-mint/80 bg-portal-mint/10 px-2.5 py-1 rounded-full border border-portal-mint/20">
            Global Rank
          </span>
        </div>

        <div className="relative my-2">
          {isLoading ? (
            <div className="h-10 w-32 bg-secondary/40 rounded-xl animate-pulse" />
          ) : (
            <>
              <p className="font-display text-4xl font-black tracking-tight text-white">
                #{overview?.globalRank?.toLocaleString() || "-"}
              </p>
              <div className="flex items-center gap-2 mt-2">
                {overview?.globalRank && overview?.totalPlayers ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-portal-mint bg-portal-mint/15 px-2.5 py-0.5 rounded-md border border-portal-mint/20">
                    <Sparkles className="h-3 w-3" />
                    Top {getPercentile(overview.globalRank, overview.totalPlayers)}% of players
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">Compete in Arena to rank up</span>
                )}
              </div>
            </>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-white/10 text-xs text-muted-foreground flex items-center justify-between font-medium">
          <span>Total registered players</span>
          <span className="font-bold text-foreground font-mono">{overview?.totalPlayers?.toLocaleString() || "0"}</span>
        </div>
      </motion.div>

      {/* Card 3: Active Competitors & Highest Level */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="p-6 rounded-3xl border border-border/40 bg-card/60 shadow-xl relative overflow-hidden flex flex-col justify-between hover:border-portal-blue/40 transition-colors duration-300 group"
      >
        <div className="portal-dot-grid absolute inset-0 opacity-15 pointer-events-none" />

        <div className="flex items-center justify-between mb-4">
          <div className="p-2.5 rounded-2xl bg-portal-blue/15 border border-portal-blue/30 text-portal-blue">
            <Users className="h-5 w-5" />
          </div>
          <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-secondary/50 px-2.5 py-1 rounded-full border border-border/40">
            <span className="h-2 w-2 rounded-full bg-portal-mint animate-ping" />
            Live Arena
          </span>
        </div>

        <div className="my-2">
          {isLoading ? (
            <div className="h-10 w-24 bg-secondary/40 rounded-xl animate-pulse" />
          ) : (
            <div className="flex items-baseline gap-3">
              <p className="font-display text-4xl font-black tracking-tight text-white">
                {overview?.totalActivePlayers?.toLocaleString() || "0"}
              </p>
              <span className="text-xs font-semibold text-muted-foreground">active players</span>
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-2 font-medium">
            Currently competing for seasonal rank points
          </p>
        </div>

        <div className="mt-4 pt-4 border-t border-border/40 flex items-center justify-between text-xs font-medium">
          <span className="flex items-center gap-1 text-muted-foreground">
            <Award className="h-3.5 w-3.5 text-portal-yellow" />
            Highest Level Reached
          </span>
          <span className="font-display font-bold text-portal-yellow text-sm">
            Lvl {overview?.highestLevel || 0}
          </span>
        </div>
      </motion.div>
    </div>
  );
}
