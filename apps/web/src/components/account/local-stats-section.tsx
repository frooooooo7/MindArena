"use client";

import { useEffect, useState } from "react";
import { GameResult, GameStats, gameResultApi } from "@/lib/game-result-api";
import { Gamepad2 } from "lucide-react";
import { StatsOverview } from "./stats-overview";
import { GameHistoryList } from "./game-history-list";

interface LocalStatsSectionProps {
  isAuthenticated: boolean;
}

export function LocalStatsSection({ isAuthenticated }: LocalStatsSectionProps) {
  const [stats, setStats] = useState<GameStats | null>(null);
  const [history, setHistory] = useState<GameResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const [statsData, historyData] = await Promise.all([
          gameResultApi.getStats("local"),
          gameResultApi.getHistory({ mode: "local", limit: 10 }),
        ]);
        setStats(statsData);
        setHistory(historyData.results);
      } catch (error) {
        console.error("Failed to fetch local stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="p-12 text-center rounded-2xl border border-dashed border-border/60 bg-secondary/5">
        <Gamepad2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
        <h3 className="text-xl font-semibold mb-2">Login to See Your Stats</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Sign in to track your local game progress and view your game history.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-6 rounded-2xl border border-border/40 bg-card/60 h-36" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <StatsOverview stats={stats} />
      <GameHistoryList history={history} />
    </div>
  );
}
