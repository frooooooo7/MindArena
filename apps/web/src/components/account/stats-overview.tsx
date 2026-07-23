"use client";

import { Brain, Gamepad2, Zap, Trophy } from "lucide-react";
import { GameStats } from "@/lib/game-result-api";

interface StatsOverviewProps {
  stats: GameStats | null;
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  const totalScore = stats?.totalScore ?? 0;
  const totalGames = stats?.totalGames ?? 0;
  const avgScore = stats?.averageScore ? Math.round(stats.averageScore) : 0;
  const maxLevel = stats?.highestLevel ?? 0;

  const statCards = [
    {
      label: "Total Score Accumulator",
      value: totalScore.toLocaleString(),
      subtext: "Across all practice sessions",
      icon: Brain,
    },
    {
      label: "Total Games Played",
      value: totalGames.toLocaleString(),
      subtext: "Completed practice rounds",
      icon: Gamepad2,
    },
    {
      label: "Average Round Score",
      value: avgScore.toLocaleString(),
      subtext: "Mean performance score",
      icon: Zap,
    },
    {
      label: "Highest Level Reached",
      value: maxLevel > 0 ? `Level ${maxLevel}` : "Level 0",
      subtext: "Peak game difficulty",
      icon: Trophy,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div
            key={i}
            className="p-5 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl shadow-xl hover:border-portal-mint/40 transition-all duration-300 group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-2xl border border-portal-mint/30 bg-portal-mint/15 text-portal-mint group-hover:scale-105 transition-transform">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <p className="text-xs font-semibold text-muted-foreground">
                {stat.label}
              </p>
              <h3 className="font-display text-3xl font-black tracking-tight text-foreground mt-1">
                {stat.value}
              </h3>
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 text-[11px] text-muted-foreground font-medium">
              {stat.subtext}
            </div>
          </div>
        );
      })}
    </div>
  );
}
