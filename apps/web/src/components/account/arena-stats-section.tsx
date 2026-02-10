"use client";

import { GameResult, GameStats, gameResultApi } from "@/lib/game-result-api";
import { Swords } from "lucide-react";
import { StatsOverview } from "./stats-overview";
import { GameHistoryList } from "./game-history-list";
import { AccountPlaceholder } from "./account-placeholder";
import { useAuthenticatedQuery } from "@/hooks/use-authenticated-query";
import { Skeleton } from "@/components/ui/skeleton";

interface ArenaStatsSectionProps {
  isAuthenticated: boolean;
}

export function ArenaStatsSection({ isAuthenticated }: ArenaStatsSectionProps) {
  const { data: stats, isLoading: statsLoading, error: statsError } = useAuthenticatedQuery<GameStats>(
    () => gameResultApi.getStats("arena"),
    isAuthenticated
  );

  const { data: historyData, isLoading: historyLoading, error: historyError } = useAuthenticatedQuery(
    () => gameResultApi.getHistory({ mode: "arena", limit: 10 }),
    isAuthenticated
  );

  const history: GameResult[] = historyData?.results ?? [];
  const isLoading = statsLoading || historyLoading;
  const error = statsError || historyError;

  if (!isAuthenticated) {
    return (
      <AccountPlaceholder
        icon={Swords}
        title="Login to See Arena Stats"
        description="Sign in to track your competitive 1v1 match history and ranking progress."
      />
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center rounded-2xl border border-red-500/20 bg-red-500/5">
        <p className="text-sm text-red-500 font-medium mb-3">Failed to load arena statistics</p>
        <button 
          onClick={() => window.location.reload()}
          className="text-xs font-semibold px-4 py-2 bg-secondary/50 hover:bg-secondary rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  if (history.length === 0 && !stats?.totalGames) {
      return (
        <div className="p-12 text-center rounded-2xl border border-dashed border-border/60 bg-secondary/5">
            <Swords className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
            <h3 className="text-xl font-semibold mb-2">No Arena Matches Yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
                You haven't played any arena matches yet. Jump into the Arena to compete with others!
            </p>
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
