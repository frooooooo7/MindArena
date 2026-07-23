"use client";

import { useAuthenticatedQuery } from "@/hooks/use-authenticated-query";
import { gameResultApi, GameStatsByType } from "@/lib/game-result-api";
import { GAME_TYPES } from "@/lib/games/game-types";
import { Award, Gamepad2, PlayCircle } from "lucide-react";
import Link from "next/link";

interface TopDisciplineCardProps {
  isAuthenticated: boolean;
  profileName?: string;
}

export function TopDisciplineCard({
  isAuthenticated,
  profileName,
}: TopDisciplineCardProps) {
  const { data: statsByType } = useAuthenticatedQuery<GameStatsByType[]>(
    () => gameResultApi.getStatsByGameType(undefined, profileName),
    isAuthenticated,
    [profileName],
  );

  const topStat = statsByType && statsByType.length > 0
    ? [...statsByType].sort((a, b) => b.bestScore - a.bestScore)[0]
    : null;

  const gameInfo = topStat
    ? GAME_TYPES.find((g) => g.id === topStat.gameType)
    : null;

  if (!topStat || !gameInfo) {
    return null;
  }

  const GameIcon = gameInfo.icon || Gamepad2;

  return (
    <div className="p-6 rounded-3xl border border-portal-mint/30 bg-gradient-to-br from-portal-mint/10 via-white/[0.02] to-transparent backdrop-blur-xl shadow-2xl relative overflow-hidden group flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div className="portal-dot-grid absolute inset-0 opacity-20 pointer-events-none" />
      <div className="absolute top-0 right-0 h-40 w-40 bg-portal-mint/15 rounded-full blur-3xl pointer-events-none group-hover:bg-portal-mint/25 transition-all duration-500" />

      <div className="flex items-center gap-5 relative z-10">
        <div className="h-16 w-16 shrink-0 rounded-2xl bg-portal-mint/20 border border-portal-mint/40 flex items-center justify-center text-portal-mint shadow-[0_0_20px_rgba(112,245,193,0.25)] group-hover:scale-105 transition-transform duration-300">
          <GameIcon className="h-8 w-8" />
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-amber-400" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-portal-mint">
              Top Memory Discipline
            </span>
          </div>
          <h3 className="font-display text-2xl font-bold text-foreground">
            {gameInfo.name}
          </h3>
          <p className="text-xs text-muted-foreground">
            Personal Record: <strong className="text-foreground font-mono">{topStat.bestScore.toLocaleString()} pts</strong> · Best Level: <strong className="text-portal-mint font-mono">Level {topStat.highestLevel}</strong>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 relative z-10 self-start md:self-auto">
        <Link
          href={`/games/${gameInfo.id}`}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-portal-mint text-[#07150f] font-extrabold text-xs transition-all hover:bg-portal-mint/90 hover:shadow-[0_0_20px_rgba(112,245,193,0.35)]"
        >
          <span>Practice Now</span>
          <PlayCircle className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
