"use client";

import { Award, Flame, Clock, Trophy, Target, Heart } from "lucide-react";
import { GameMode } from "@/lib/games/fast-math/types";

interface GameHeaderProps {
  score: number;
  streak: number;
  timeLeft: number;
  equationsLeft: number;
  lives: number;
  gameMode: GameMode;
  bestScore: number | null;
}

export function GameHeader({
  score,
  streak,
  timeLeft,
  equationsLeft,
  lives,
  gameMode,
  bestScore,
}: GameHeaderProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 w-full max-w-xl">
      {/* Score */}
      <div className="p-4 flex flex-col items-center justify-center rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-portal-mint/30 shadow-xl">
        <div className="flex items-center gap-1.5 text-portal-mint text-xs font-bold uppercase tracking-wider mb-1">
          <Award className="size-3.5" />
          <span>Score</span>
        </div>
        <span className="font-display text-3xl md:text-4xl font-extrabold text-portal-mint tracking-tight">
          {score}
        </span>
      </div>

      {/* Streak / Combo */}
      <div className="p-4 flex flex-col items-center justify-center rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-portal-yellow/30 shadow-xl">
        <div className="flex items-center gap-1.5 text-portal-yellow text-xs font-bold uppercase tracking-wider mb-1">
          <Flame className="size-3.5" />
          <span>Streak (Combo)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-display text-2xl md:text-3xl font-extrabold text-portal-yellow">
            {streak}
          </span>
          {streak >= 3 && (
            <span className="rounded-md bg-portal-yellow px-1.5 py-0.5 text-[10px] font-extrabold text-[#07150f]">
              x{Math.min(streak, 5)}
            </span>
          )}
        </div>
      </div>

      {/* Timer / Equations / Lives */}
      <div className="p-4 flex flex-col items-center justify-center rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-portal-blue/30 shadow-xl">
        <div className="flex items-center gap-1.5 text-portal-blue text-xs font-bold uppercase tracking-wider mb-1">
          {gameMode === "blitz" ? (
            <>
              <Clock className="size-3.5" />
              <span>Time Left</span>
            </>
          ) : gameMode === "equations" ? (
            <>
              <Target className="size-3.5" />
              <span>Equations</span>
            </>
          ) : (
            <>
              <Heart className="size-3.5 text-rose-400" />
              <span>Lives Left</span>
            </>
          )}
        </div>
        <span className="text-xl md:text-2xl font-mono font-bold text-foreground tracking-tight">
          {gameMode === "blitz" ? (
            `${timeLeft}s`
          ) : gameMode === "equations" ? (
            `${equationsLeft}`
          ) : (
            <span className="flex items-center gap-1 text-rose-400">
              {"❤️".repeat(Math.max(0, lives))}
            </span>
          )}
        </span>
      </div>

      {/* Best Score */}
      <div className="p-4 flex flex-col items-center justify-center rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-portal-violet/30 shadow-xl">
        <div className="flex items-center gap-1.5 text-portal-violet text-xs font-bold uppercase tracking-wider mb-1">
          <Trophy className="size-3.5" />
          <span>High Score</span>
        </div>
        <span className="text-xl md:text-2xl font-mono font-bold text-portal-violet">
          {bestScore !== null ? bestScore : "---"}
        </span>
      </div>
    </div>
  );
}
