"use client";

import { cn } from "@/lib/utils";
import type { Cell } from "@/lib/games/chimp-memory";
import { GRID_COLS } from "@/lib/games/chimp-memory";

interface ChimpGridProps {
  cells: Cell[];
  disabled: boolean;
  onCellClick: (id: number) => void;
}

export function ChimpGrid({ cells, disabled, onCellClick }: ChimpGridProps) {
  return (
    <div
      className="grid gap-1.5 sm:gap-2 p-4 bg-card/50 rounded-2xl backdrop-blur-sm border border-border/50"
      style={{
        gridTemplateColumns: `repeat(${GRID_COLS}, minmax(0, 1fr))`,
      }}
    >
      {cells.map((cell) => {
        const hasNumber = cell.number !== null;
        const showNumber = hasNumber && cell.revealed;
        const isHidden = hasNumber && !cell.revealed && !cell.completed;
        const isCompleted = cell.completed;

        return (
          <button
            key={cell.id}
            disabled={disabled || !hasNumber || isCompleted}
            onClick={() => onCellClick(cell.id)}
            className={cn(
              "aspect-square rounded-lg sm:rounded-xl transition-all duration-200 text-sm sm:text-lg font-bold",
              "w-8 h-8 sm:w-12 sm:h-12 md:w-14 md:h-14",
              !hasNumber && "bg-transparent cursor-default",
              hasNumber && showNumber && !isCompleted &&
                "bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/30",
              isHidden &&
                "bg-gradient-to-br from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 cursor-pointer shadow-md",
              isCompleted &&
                "bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/30"
            )}
          >
            {showNumber && cell.number}
          </button>
        );
      })}
    </div>
  );
}
