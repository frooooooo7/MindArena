"use client";

import { useMemo } from "react";
import { GameResult, GameStats, gameResultApi } from "@/lib/game-result-api";
import { GAME_TYPES } from "@/lib/games/game-types";
import { Swords, Trophy, XCircle, TrendingUp, Gamepad2, Clock, CheckCircle2 } from "lucide-react";
import { AccountPlaceholder } from "./account-placeholder";
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
      color: found ? found.color : "from-cyan-500 to-blue-500",
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
      <div className="p-8 text-center rounded-2xl border border-red-500/20 bg-red-500/5">
        <p className="text-sm text-red-500 font-medium mb-3">
          Failed to load friend duel statistics
        </p>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Duels",
      value: totalDuels.toString(),
      subtext: "Matches played",
      icon: Swords,
      color: "text-cyan-400",
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/20",
    },
    {
      label: "Duels Won",
      value: wins.toString(),
      subtext: "Victories",
      icon: Trophy,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
    {
      label: "Duels Lost",
      value: losses.toString(),
      subtext: "Defeats",
      icon: XCircle,
      color: "text-rose-400",
      bg: "bg-rose-500/10",
      border: "border-rose-500/20",
    },
    {
      label: "Win Rate %",
      value: `${winRate}%`,
      subtext: "Overall accuracy",
      icon: TrendingUp,
      color: "text-violet-400",
      bg: "bg-violet-500/10",
      border: "border-violet-500/20",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Friend Duels Statistics Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <div
            key={i}
            className={`p-6 rounded-2xl border ${stat.border} bg-card/60 hover:border-border transition-colors duration-200`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <span className="text-[10px] uppercase font-extrabold text-muted-foreground tracking-wider">
                Friend Duels
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-black tracking-tight text-white">
                {stat.value}
              </p>
              <p className="text-xs text-muted-foreground font-medium">
                {stat.label}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-border/20">
              <span className={`text-[11px] font-bold ${stat.color}`}>
                {stat.subtext}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Duels Match History against Friends */}
      <div className="p-6 rounded-3xl border border-border/40 bg-card/60 backdrop-blur-xl shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-border/40 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
              <Swords className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">
                Recent Friend Match History
              </h3>
              <p className="text-xs text-muted-foreground">
                Your latest 1v1 memory duels against friends
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-secondary/40 border border-border/40 text-muted-foreground">
            {history.length} duels
          </span>
        </div>

        {history.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-dashed border-border/60 bg-secondary/5">
            <Swords className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-bold text-white mb-1">
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
                  className="flex items-center justify-between p-4 rounded-2xl border border-border/40 bg-secondary/15 hover:bg-secondary/30 transition-all duration-200"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-3 rounded-xl bg-gradient-to-br ${game.color} shadow-md`}
                    >
                      <GameIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-sm">
                          {game.name}
                        </h4>
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                            isWin
                              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                              : "bg-rose-500/15 text-rose-400 border-rose-500/30"
                          }`}
                        >
                          {isWin ? (
                            <>
                              <CheckCircle2 className="h-3 w-3" /> Victory
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3" /> Defeat
                            </>
                          )}
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

                  <div className="text-right">
                    <p className="text-xs font-semibold text-white">
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
