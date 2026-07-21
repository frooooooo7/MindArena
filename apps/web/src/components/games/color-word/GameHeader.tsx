"use client";

import { Flame, Clock, Trophy, Target, Award } from "lucide-react";
import { GameMode } from "@/lib/games/color-word/types";

interface GameHeaderProps {
  score: number;
  streak: number;
  timeLeft: number;
  roundsLeft: number;
  gameMode: GameMode;
  bestScore: number | null;
}

export function GameHeader({
  score,
  streak,
  timeLeft,
  roundsLeft,
  gameMode,
  bestScore,
}: GameHeaderProps) {
  const isTimedMode = gameMode !== "rounds";

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 w-full max-w-xl">
      {/* Score */}
      <div className="p-4 flex flex-col items-center justify-center rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-portal-pink/30 shadow-xl">
        <div className="flex items-center gap-1.5 text-portal-pink text-xs font-bold uppercase tracking-wider mb-1">
          <Award className="size-3.5" />
          <span>Score</span>
        </div>
        <span className="font-display text-3xl md:text-4xl font-extrabold text-portal-pink tracking-tight">
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

      {/* Timer / Rounds Left */}
      <div className="p-4 flex flex-col items-center justify-center rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-portal-blue/30 shadow-xl">
        <div className="flex items-center gap-1.5 text-portal-blue text-xs font-bold uppercase tracking-wider mb-1">
          {isTimedMode ? (
            <>
              <Clock className="size-3.5" />
              <span>Time Left</span>
            </>
          ) : (
            <>
              <Target className="size-3.5" />
              <span>Rounds</span>
            </>
          )}
        </div>
        <span className="text-xl md:text-2xl font-mono font-bold text-foreground tracking-tight">
          {isTimedMode ? `${timeLeft}s` : `${roundsLeft} / 20`}
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

