"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Target, Trophy, AlertTriangle, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { GridSize, OrderDirection } from "@/lib/games/schulte-table/types";

interface GameHeaderProps {
  gridSize: GridSize;
  orderDirection: OrderDirection;
  currentNumber: number;
  elapsedMs: number;
  mistakes: number;
  bestTime: number | null;
}

export function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const millis = Math.floor((ms % 1000) / 10);
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(mins)}:${pad(secs)}.${pad(millis)}`;
}

export function GameHeader({
  gridSize,
  orderDirection,
  currentNumber,
  elapsedMs,
  mistakes,
  bestTime,
}: GameHeaderProps) {
  const total = gridSize * gridSize;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 w-full max-w-2xl">
      {/* Target Number */}
      <Card className="p-4 flex flex-col items-center justify-center bg-card/60 backdrop-blur border-amber-500/20 shadow-lg shadow-amber-500/5">
        <div className="flex items-center gap-1.5 text-amber-500 text-xs font-semibold uppercase tracking-wider mb-1">
          <Target className="w-3.5 h-3.5" />
          <span>Szukaj liczby</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl md:text-4xl font-extrabold text-amber-400 tracking-tight">
            {currentNumber}
          </span>
          <span className="text-xs text-muted-foreground font-medium">
            / {orderDirection === "asc" ? total : 1}
          </span>
        </div>
      </Card>

      {/* Timer */}
      <Card className="p-4 flex flex-col items-center justify-center bg-card/60 backdrop-blur border-cyan-500/20 shadow-lg shadow-cyan-500/5">
        <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1">
          <Clock className="w-3.5 h-3.5" />
          <span>Czas</span>
        </div>
        <span className="text-2xl md:text-3xl font-mono font-bold text-foreground tracking-tight">
          {formatTime(elapsedMs)}
        </span>
      </Card>

      {/* Mode & Direction */}
      <Card className="p-4 flex flex-col items-center justify-center bg-card/60 backdrop-blur border-violet-500/20 shadow-lg shadow-violet-500/5">
        <div className="flex items-center gap-1 text-violet-400 text-xs font-semibold uppercase tracking-wider mb-1">
          <span>Siatka / Tryb</span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <Badge variant="secondary" className="font-bold">
            {gridSize}x{gridSize}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1 border-violet-500/40 text-violet-300">
            {orderDirection === "asc" ? (
              <>
                <span>1→{total}</span>
                <ArrowUpRight className="w-3 h-3" />
              </>
            ) : (
              <>
                <span>{total}→1</span>
                <ArrowDownRight className="w-3 h-3" />
              </>
            )}
          </Badge>
        </div>
      </Card>

      {/* Record & Mistakes */}
      <Card className="p-4 flex flex-col items-center justify-center bg-card/60 backdrop-blur border-emerald-500/20 shadow-lg shadow-emerald-500/5">
        <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
          <Trophy className="w-3.5 h-3.5" />
          <span>Najlepszy czas</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xl md:text-2xl font-mono font-bold text-emerald-400">
            {bestTime ? formatTime(bestTime) : "--:--.--"}
          </span>
          {mistakes > 0 && (
            <Badge variant="destructive" className="flex items-center gap-1 px-1.5 text-[10px]">
              <AlertTriangle className="w-3 h-3" />
              {mistakes}
            </Badge>
          )}
        </div>
      </Card>
    </div>
  );
}
