"use client";

import { useMemo } from "react";
import { GameResult, GameStats, gameResultApi } from "@/lib/game-result-api";
import { GAME_TYPES } from "@/lib/games/game-types";
import { Swords, Trophy, XCircle, TrendingUp, Gamepad2, Clock } from "lucide-react";
import { AccountPlaceholder } from "./account-placeholder";
import { StatsMetricGrid, StatsMetricGridSkeleton } from "./stats-bento";
import { useAuthenticatedQuery } from "@/hooks/use-authenticated-query";
import { Skeleton } from "@/components/ui/skeleton";

interface FriendStatsSectionProps {
  isAuthenticated: boolean;
  profileName?: string;
}

export function FriendStatsSection({
  isAuthenticated,
  profileName,
}: FriendStatsSectionProps) {
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
  } = useAuthenticatedQuery<GameStats>(
    () => gameResultApi.getStats("arena", profileName),
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
        mode: "arena",
        limit: 15,
        userName: profileName,
      }),
    isAuthenticated,
    [profileName],
  );

  const history: GameResult[] = historyData?.results ?? [];
  const isLoading = statsLoading || historyLoading;
  const error = statsError || historyError;

  const totalDuels = stats?.totalGames ?? history.length;
  const wins = useMemo(() => {
    return history.filter((game) => game.score > 0).length;
  }, [history]);
  const losses = Math.max(0, totalDuels - wins);
  const winRate = totalDuels > 0 ? Math.round((wins / totalDuels) * 100) : 0;

  const getGameInfo = (typeId: string) => {
    const found = GAME_TYPES.find((g) => g.id === typeId);
    return {
      name: found ? found.name : typeId,
      icon: found ? found.icon : Gamepad2,
      color: found ? found.color : "from-portal-mint to-teal-500",
    };
  };

  if (!isAuthenticated) {
    return (
      <AccountPlaceholder
        icon={Swords}
        title="Login to View Friend Duels Stats"
        description="Sign in to track your 1v1 friend duels, win rate %, and match history."
      />
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center rounded-3xl border border-red-500/20 bg-red-500/5">
        <p className="text-xs text-red-400 font-medium mb-3">
          Failed to load friend duel statistics
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
      <div className="space-y-6">
        <StatsMetricGridSkeleton />
        <Skeleton className="h-64 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <StatsMetricGrid
        metrics={[
          {
            label: "Total Duels",
            value: totalDuels.toString(),
            numericValue: totalDuels,
            subtext: "Matches played",
            icon: Swords,
          },
          {
            label: "Duels Won",
            value: wins.toString(),
            numericValue: wins,
            subtext: "Victories",
            icon: Trophy,
          },
          {
            label: "Duels Lost",
            value: losses.toString(),
            numericValue: losses,
            subtext: "Defeats",
            icon: XCircle,
            tone: "rose",
          },
          {
            label: "Win Rate %",
            value: `${winRate}%`,
            numericValue: winRate,
            valueSuffix: "%",
            subtext: "Head-to-head accuracy",
            icon: TrendingUp,
          },
        ]}
      />

      {/* Recent Duels Match History against Friends */}
      <div className="p-6 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-portal-mint/15 border border-portal-mint/30 text-portal-mint">
              <Swords className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground">
                Recent Friend Match History
              </h3>
              <p className="text-xs text-muted-foreground">
                Your latest 1v1 memory duels against friends
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-muted-foreground font-mono">
            {history.length} duels
          </span>
        </div>

        {history.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-dashed border-white/10 bg-white/[0.01]">
            <Swords className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-bold text-foreground mb-1">
              No Friend Duels Yet
            </h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              You haven&apos;t played any 1v1 duels against friends yet.
              Challenge a friend to build your match history!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((match) => {
              const game = getGameInfo(match.gameType);
              const GameIcon = game.icon;
              const isWin = match.score > 0;

              return (
                <div
                  key={match.id}
                  className="flex items-center justify-between p-4 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-200"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="p-3 rounded-xl bg-portal-mint/15 border border-portal-mint/30 text-portal-mint shadow-md"
                    >
                      <GameIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-foreground text-sm">
                          {game.name}
                        </h4>
                        <span
                          className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                            isWin
                              ? "bg-portal-mint/15 text-portal-mint border-portal-mint/30"
                              : "bg-rose-500/15 text-rose-400 border-rose-500/30"
                          }`}
                        >
                          {isWin ? "Victory" : "Defeat"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span>Level {match.level}</span>
                        <span>•</span>
                        <span>{match.score.toLocaleString()} pts</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {match.duration}s
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <p className="text-xs font-semibold text-foreground">
                      {new Date(match.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {new Date(match.createdAt).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
