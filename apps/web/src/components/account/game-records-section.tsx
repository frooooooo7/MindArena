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
  profileName?: string;
  isOwner?: boolean;
}

export function GameRecordsSection({
  isAuthenticated,
  profileName,
  isOwner = true,
}: GameRecordsSectionProps) {
  const [mode, setMode] = useState<GameMode>("local");

  const {
    data: stats,
    isLoading,
    error,
  } = useAuthenticatedQuery<GameStatsByType[]>(
    () => gameResultApi.getStatsByGameType(mode, profileName),
    isAuthenticated,
    [mode, profileName],
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
      <div className="p-8 text-center rounded-3xl border border-red-500/20 bg-red-500/5">
        <p className="text-xs text-red-400 font-medium mb-3">
          Failed to load game records
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
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-8 w-48 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <Trophy className="h-5 w-5 text-portal-mint" />
          <h3 className="font-display text-xl font-bold uppercase tracking-tight text-foreground">
            {isOwner ? "Your Game Records" : "Player Game Records"}
          </h3>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center gap-1 p-1.5 bg-white/[0.03] rounded-2xl border border-white/10 w-fit">
          <button
            type="button"
            onClick={() => setMode("local")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
              mode === "local"
                ? "bg-portal-mint text-[#07150f] shadow-[0_0_12px_rgba(112,245,193,0.3)]"
                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
            }`}
          >
            <Gamepad2 className="h-3.5 w-3.5" />
            Local Practice
          </button>
          <button
            type="button"
            onClick={() => setMode("arena")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
              mode === "arena"
                ? "bg-portal-mint text-[#07150f] shadow-[0_0_12px_rgba(112,245,193,0.3)]"
                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
            }`}
          >
            <Swords className="h-3.5 w-3.5" />
            Friend Duels
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
              className="p-6 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl shadow-xl hover:border-portal-mint/40 transition-all duration-300 group flex flex-col justify-between"
            >
              <div>
                {/* Game Header */}
                <div className="flex items-center gap-3.5 mb-6">
                  <div
                    className="p-3 rounded-2xl bg-portal-mint/15 border border-portal-mint/30 text-portal-mint group-hover:scale-105 transition-transform"
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground text-base">{game.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {game.difficulty}
                    </p>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <p className="text-2xl font-display font-black text-portal-mint">
                      {gameStat?.bestScore?.toLocaleString() ?? "0"}
                    </p>
                    <p className="text-[9px] uppercase text-muted-foreground font-bold tracking-wider">
                      Best Score
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-display font-bold text-foreground">
                      Lvl {gameStat?.highestLevel ?? 0}
                    </p>
                    <p className="text-[9px] uppercase text-muted-foreground font-bold tracking-wider">
                      Highest Level
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-display font-bold text-foreground/80">
                      {gameStat?.totalScore?.toLocaleString() ?? "0"}
                    </p>
                    <p className="text-[9px] uppercase text-muted-foreground font-bold tracking-wider">
                      Total Score
                    </p>
                  </div>
                </div>
              </div>

              {/* Games Played */}
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-medium text-muted-foreground">
                <span>Games Played</span>
                <span className="font-bold font-mono text-foreground">
                  {gameStat?.totalGames ?? 0}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
