"use client";

import { Brain, Gamepad2, Zap, Trophy } from "lucide-react";
import { GameStats } from "@/lib/game-result-api";
import { StatsMetricGrid } from "./stats-bento";

interface StatsOverviewProps {
  stats: GameStats | null;
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  const totalScore = stats?.totalScore ?? 0;
  const totalGames = stats?.totalGames ?? 0;
  const avgScore = stats?.averageScore ? Math.round(stats.averageScore) : 0;
  const maxLevel = stats?.highestLevel ?? 0;

  return (
    <StatsMetricGrid
      metrics={[
        {
          label: "Total Score Accumulator",
          value: totalScore.toLocaleString(),
          numericValue: totalScore,
          subtext: "Across all practice sessions",
          icon: Brain,
        },
        {
          label: "Total Games Played",
          value: totalGames.toLocaleString(),
          numericValue: totalGames,
          subtext: "Completed practice rounds",
          icon: Gamepad2,
        },
        {
          label: "Average Round Score",
          value: avgScore.toLocaleString(),
          numericValue: avgScore,
          subtext: "Mean performance score",
          icon: Zap,
        },
        {
          label: "Highest Level Reached",
          value: maxLevel > 0 ? `Level ${maxLevel}` : "Level 0",
          numericValue: maxLevel,
          valuePrefix: "Level ",
          subtext: "Peak game difficulty",
          icon: Trophy,
        },
      ]}
    />
  );
}
