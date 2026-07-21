"use client";

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
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 w-full max-w-xl">
      {/* Target Number */}
      <div className="p-4 flex flex-col items-center justify-center rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-amber-400/30 shadow-xl">
        <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
          <Target className="size-3.5" />
          <span>Next Target</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="font-display text-3xl md:text-4xl font-extrabold text-amber-400 tracking-tight">
            {currentNumber}
          </span>
          <span className="text-xs text-muted-foreground font-semibold">
            / {orderDirection === "asc" ? total : 1}
          </span>
        </div>
      </div>

      {/* Timer */}
      <div className="p-4 flex flex-col items-center justify-center rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-portal-blue/30 shadow-xl">
        <div className="flex items-center gap-1.5 text-portal-blue text-xs font-bold uppercase tracking-wider mb-1">
          <Clock className="size-3.5" />
          <span>Elapsed Time</span>
        </div>
        <span className="text-xl md:text-2xl font-mono font-bold text-foreground tracking-tight">
          {formatTime(elapsedMs)}
        </span>
      </div>

      {/* Mode & Direction */}
      <div className="p-4 flex flex-col items-center justify-center rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-portal-violet/30 shadow-xl">
        <div className="flex items-center gap-1 text-portal-violet text-xs font-bold uppercase tracking-wider mb-1">
          <span>Grid Mode</span>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="rounded-lg bg-portal-violet/20 px-2 py-0.5 text-xs font-bold text-portal-violet">
            {gridSize}x{gridSize}
          </span>
          <span className="inline-flex items-center gap-1 rounded-lg border border-portal-violet/30 px-2 py-0.5 text-xs font-semibold text-portal-violet">
            {orderDirection === "asc" ? (
              <>
                <span>1→{total}</span>
                <ArrowUpRight className="size-3" />
              </>
            ) : (
              <>
                <span>{total}→1</span>
                <ArrowDownRight className="size-3" />
              </>
            )}
          </span>
        </div>
      </div>

      {/* Record & Mistakes */}
      <div className="p-4 flex flex-col items-center justify-center rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-portal-mint/30 shadow-xl">
        <div className="flex items-center gap-1.5 text-portal-mint text-xs font-bold uppercase tracking-wider mb-1">
          <Trophy className="size-3.5" />
          <span>Best Record</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xl md:text-2xl font-mono font-bold text-portal-mint">
            {bestTime ? formatTime(bestTime) : "--:--.--"}
          </span>
          {mistakes > 0 && (
            <span className="inline-flex items-center gap-1 rounded-md bg-destructive/20 px-1.5 py-0.5 text-[10px] font-bold text-destructive">
              <AlertTriangle className="size-3" />
              {mistakes}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

