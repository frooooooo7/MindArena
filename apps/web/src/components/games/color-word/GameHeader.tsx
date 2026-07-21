"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 w-full max-w-2xl">
      {/* Score */}
      <Card className="p-4 flex flex-col items-center justify-center bg-card/60 backdrop-blur border-rose-500/20 shadow-lg shadow-rose-500/5">
        <div className="flex items-center gap-1.5 text-rose-400 text-xs font-semibold uppercase tracking-wider mb-1">
          <Award className="w-3.5 h-3.5" />
          <span>Wynik</span>
        </div>
        <span className="text-3xl md:text-4xl font-extrabold text-rose-400 tracking-tight">
          {score}
        </span>
      </Card>

      {/* Streak / Combo */}
      <Card className="p-4 flex flex-col items-center justify-center bg-card/60 backdrop-blur border-amber-500/20 shadow-lg shadow-amber-500/5">
        <div className="flex items-center gap-1.5 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
          <Flame className="w-3.5 h-3.5" />
          <span>Seria (Combo)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-2xl md:text-3xl font-extrabold text-amber-400">
            {streak}
          </span>
          {streak >= 3 && (
            <Badge className="bg-amber-500 text-black font-extrabold animate-bounce">
              x{Math.min(streak, 5)}
            </Badge>
          )}
        </div>
      </Card>

      {/* Timer / Rounds Left */}
      <Card className="p-4 flex flex-col items-center justify-center bg-card/60 backdrop-blur border-cyan-500/20 shadow-lg shadow-cyan-500/5">
        <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1">
          {isTimedMode ? (
            <>
              <Clock className="w-3.5 h-3.5" />
              <span>Pozostały Czas</span>
            </>
          ) : (
            <>
              <Target className="w-3.5 h-3.5" />
              <span>Rundy</span>
            </>
          )}
        </div>
        <span className="text-2xl md:text-3xl font-mono font-bold text-foreground tracking-tight">
          {isTimedMode ? `${timeLeft}s` : `${roundsLeft} / 20`}
        </span>
      </Card>

      {/* Best Score */}
      <Card className="p-4 flex flex-col items-center justify-center bg-card/60 backdrop-blur border-purple-500/20 shadow-lg shadow-purple-500/5">
        <div className="flex items-center gap-1.5 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-1">
          <Trophy className="w-3.5 h-3.5" />
          <span>Rekord</span>
        </div>
        <span className="text-xl md:text-2xl font-mono font-bold text-purple-300">
          {bestScore !== null ? bestScore : "---"}
        </span>
      </Card>
    </div>
  );
}
