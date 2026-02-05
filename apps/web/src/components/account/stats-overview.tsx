"use client";

import { Brain, Gamepad2, Zap, Activity } from "lucide-react";
import { GameStats } from "@/lib/game-result-api";

interface StatsOverviewProps {
  stats: GameStats | null;
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  // Use user-requested streamlined stats: Total Score and Games Played only
  // (Original Average Score and Highest Level were removed per user request)
  const statCards = [
    {
      label: "Total Score",
      value: stats?.totalScore.toLocaleString() ?? "0",
      change: `${stats?.totalGames ?? 0} games`,
      icon: Brain,
      color: "text-violet-500",
      bg: "bg-violet-500/10",
    },
    {
      label: "Games Played",
      value: stats?.totalGames.toString() ?? "0",
      change: "Local mode",
      icon: Gamepad2,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    // Previously removed: Average Score, Highest Level
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, i) => (
        <div
          key={i}
          className="p-6 rounded-2xl border border-border/40 bg-card/60 hover:border-border transition-colors duration-200"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-2 rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon className="h-5 w-5" />
            </div>
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
              Local
            </span>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
            <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
          </div>
          <div className="mt-4 pt-4 border-t border-border/20">
            <span className={`text-[10px] font-bold ${stat.color}`}>{stat.change}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
