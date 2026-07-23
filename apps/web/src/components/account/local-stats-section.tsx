"use client";

import { GameResult, GameStats, gameResultApi } from "@/lib/game-result-api";
import { Gamepad2 } from "lucide-react";
import { StatsOverview } from "./stats-overview";
import { TopDisciplineCard } from "./top-discipline-card";
import { GameHistoryList } from "./game-history-list";
import { AccountPlaceholder } from "./account-placeholder";
import { useAuthenticatedQuery } from "@/hooks/use-authenticated-query";

interface LocalStatsSectionProps {
  isAuthenticated: boolean;
  profileName?: string;
}

export function LocalStatsSection({
  isAuthenticated,
  profileName,
}: LocalStatsSectionProps) {
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
  } = useAuthenticatedQuery<GameStats>(
    () => gameResultApi.getStats("local", profileName),
    isAuthenticated,
    [profileName],
  );

  const {
    data: historyData,
    isLoading: historyLoading,
    error: historyError,
  } = useAuthenticatedQuery(
    () =>
      gameResultApi.getHistory({
        mode: "local",
        limit: 10,
        userName: profileName,
      }),
    isAuthenticated,
    [profileName],
  );

  const history: GameResult[] = historyData?.results ?? [];
  const isLoading = statsLoading || historyLoading;
  const error = statsError || historyError;

  if (!isAuthenticated) {
    return (
      <AccountPlaceholder
        icon={Gamepad2}
        title="Login to See Your Stats"
        description="Sign in to track your local game progress and view your game history."
      />
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center rounded-3xl border border-red-500/20 bg-red-500/5">
        <p className="text-xs text-red-400 font-medium mb-3">
          Failed to load statistics
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="text-xs font-bold px-4 py-2 bg-secondary/50 hover:bg-secondary rounded-xl transition-colors text-white"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="p-6 rounded-3xl border border-white/10 bg-white/[0.02] h-36"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <StatsOverview stats={stats} />
      <TopDisciplineCard isAuthenticated={isAuthenticated} profileName={profileName} />
      <GameHistoryList history={history} />
    </div>
  );
}
