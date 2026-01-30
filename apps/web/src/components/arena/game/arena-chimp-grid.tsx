"use client";

import { cn } from "@/lib/utils";
import { ChimpCell } from "@mindarena/shared";

const GRID_COLS = 8;

interface ArenaChimpGridProps {
  cells: ChimpCell[];
  disabled: boolean;
  onCellClick: (cellId: number) => void;
}

export function ArenaChimpGrid({
  cells,
  disabled,
  onCellClick,
}: ArenaChimpGridProps) {
  return (
    <div
      className="grid gap-1.5 sm:gap-2 p-4 bg-card/50 rounded-2xl backdrop-blur-sm border border-border/50"
      style={{
        gridTemplateColumns: `repeat(${GRID_COLS}, minmax(0, 1fr))`,
      }}
    >
      {cells.map((cell) => {
        const hasNumber = cell.number !== null;
        const showNumber = hasNumber && cell.revealed && !cell.completed;
        const isHidden = hasNumber && !cell.revealed && !cell.completed;
        const isCompleted = cell.completed;

        return (
          <button
            key={cell.id}
            disabled={disabled || !hasNumber || isCompleted}
            onClick={() => onCellClick(cell.id)}
            className={cn(
              "aspect-square rounded-lg sm:rounded-xl transition-all duration-200 text-sm sm:text-lg font-bold",
              "w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12",
              // Empty cell
              !hasNumber && "bg-transparent cursor-default",
              // Showing number (memorize phase)
              hasNumber &&
                showNumber &&
                "bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/30",
              // Hidden number (playing phase)
              isHidden &&
                "bg-gradient-to-br from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 cursor-pointer shadow-md",
              // Completed (correct click)
              isCompleted &&
                "bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/30",
              // Disabled state
              disabled &&
                !isCompleted &&
                hasNumber &&
                "cursor-not-allowed opacity-70",
            )}
          >
            {showNumber && cell.number}
            {isCompleted && cell.number}
          </button>
        );
      })}
    </div>
  );
}
