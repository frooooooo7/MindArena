"use client";

import { GameStatsByType, gameResultApi } from "@/lib/game-result-api";
import { GAME_TYPES } from "@/lib/games/game-types";
import { Trophy, Gamepad2, Swords } from "lucide-react";
import { AccountPlaceholder } from "./account-placeholder";
import { useAuthenticatedQuery } from "@/hooks/use-authenticated-query";
import { useState } from "react";
import { GameMode } from "@mindarena/shared";
import { Skeleton } from "@/components/ui/skeleton";

interface GameRecordsSectionProps {
  isAuthenticated: boolean;
}

export function GameRecordsSection({ isAuthenticated }: GameRecordsSectionProps) {
  const [mode, setMode] = useState<GameMode>("local");
  
  const { data: stats, isLoading, error } = useAuthenticatedQuery<GameStatsByType[]>(
    () => gameResultApi.getStatsByGameType(mode),
    isAuthenticated,
    [mode] // Refetch when mode changes
  );

  if (!isAuthenticated) {
    return (
      <AccountPlaceholder
        icon={Trophy}
        title="Login to See Your Records"
        description="Sign in to view your best scores and records for each game."
      />
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center rounded-2xl border border-red-500/20 bg-red-500/5">
        <p className="text-sm text-red-500 font-medium mb-3">Failed to load game records</p>
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
        <div className="flex items-center gap-2 mb-4">
            <Skeleton className="h-8 w-48 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-violet-500" />
          <h3 className="text-lg font-semibold">Your Records</h3>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center gap-1 p-1 bg-secondary/20 rounded-xl border border-border/40 w-fit">
          <button
            onClick={() => setMode("local")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
              mode === "local"
                ? "bg-violet-600 text-white shadow-md shadow-violet-500/20"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Gamepad2 className="h-3.5 w-3.5" />
            Local
          </button>
          <button
            onClick={() => setMode("arena")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
              mode === "arena"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Swords className="h-3.5 w-3.5" />
            Arena
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {GAME_TYPES.map((game) => {
          const gameStat = stats?.find((s) => s.gameType === game.id);
          const Icon = game.icon;

          return (
            <div
              key={game.id}
              className="p-6 rounded-2xl border border-border/40 bg-card/60 hover:border-border transition-colors duration-200"
            >
              {/* Game Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${game.color}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold">{game.name}</h4>
                  <p className="text-xs text-muted-foreground">{game.difficulty}</p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-violet-500">
                    {gameStat?.bestScore?.toLocaleString() ?? "0"}
                  </p>
                  <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">
                    Best Score
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-emerald-500">
                    Lvl {gameStat?.highestLevel ?? 0}
                  </p>
                  <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">
                    Highest Level
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-amber-500">
                    {gameStat?.totalScore?.toLocaleString() ?? "0"}
                  </p>
                  <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">
                    Total Score
                  </p>
                </div>
              </div>

              {/* Games Played */}
              <div className="mt-4 pt-4 border-t border-border/20 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Games Played</span>
                <span className="text-sm font-bold">{gameStat?.totalGames ?? 0}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
