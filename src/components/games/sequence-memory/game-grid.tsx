"use client";

import { cn } from "@/lib/utils";

interface GameGridProps {
  gridSize: number;
  activeCell: number | null;
  clickedCell: number | null;
  disabled: boolean;
  onCellClick: (index: number) => void;
}

export function GameGrid({
  gridSize,
  activeCell,
  clickedCell,
  disabled,
  onCellClick,
}: GameGridProps) {
  const cells = Array.from({ length: gridSize * gridSize }, (_, i) => i);

  return (
    <div
      className="grid gap-2 p-4 bg-card/50 rounded-2xl backdrop-blur-sm border border-border/50"
      style={{
        gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
        maxWidth: `${gridSize * 80 + (gridSize - 1) * 8 + 32}px`,
      }}
    >
      {cells.map((index) => (
        <button
          key={index}
          disabled={disabled}
          onClick={() => onCellClick(index)}
          className={cn(
            "aspect-square rounded-xl transition-all duration-200 border-2",
            "w-16 h-16 sm:w-20 sm:h-20",
            activeCell === index
              ? "bg-gradient-to-br from-violet-500 to-indigo-600 border-violet-400 shadow-lg shadow-violet-500/50 scale-105"
              : clickedCell === index
              ? "bg-gradient-to-br from-violet-400 to-indigo-500 border-violet-300 scale-95"
              : "bg-muted/50 border-border hover:bg-muted hover:border-violet-500/50 hover:scale-102",
            disabled && activeCell !== index && "cursor-not-allowed opacity-50"
          )}
        />
      ))}
    </div>
  );
}
