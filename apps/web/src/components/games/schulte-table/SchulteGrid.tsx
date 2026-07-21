"use client";

import { Cell, GridSize, GameState } from "@/lib/games/schulte-table/types";
import { Button } from "@/components/ui/button";
import { Check, Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface SchulteGridProps {
  cells: Cell[];
  gridSize: GridSize;
  gameState: GameState;
  countdown: number;
  onCellClick: (cellId: number) => void;
  onStartGame: () => void;
}

const GRID_COLS_CLASS: Record<GridSize, string> = {
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-6",
};

const FONT_SIZE_CLASS: Record<GridSize, string> = {
  3: "text-3xl md:text-5xl font-bold",
  4: "text-2xl md:text-4xl font-bold",
  5: "text-xl md:text-3xl font-extrabold",
  6: "text-lg md:text-2xl font-extrabold",
};

export function SchulteGrid({
  cells,
  gridSize,
  gameState,
  countdown,
  onCellClick,
  onStartGame,
}: SchulteGridProps) {
  const isPlaying = gameState === "playing";

  return (
    <div className="relative w-full max-w-xl aspect-square p-3 md:p-4 rounded-3xl bg-white/[0.03] backdrop-blur-2xl border border-white/10 shadow-2xl overflow-hidden flex items-center justify-center">
      {/* Grid Container */}
      <div
        className={cn(
          "grid gap-2 md:gap-3 w-full h-full",
          GRID_COLS_CLASS[gridSize]
        )}
      >
        {cells.map((cell) => {
          return (
            <button
              key={cell.id}
              type="button"
              disabled={!isPlaying || cell.completed}
              onClick={() => onCellClick(cell.id)}
              className={cn(
                "relative flex items-center justify-center rounded-xl transition-all duration-150 select-none touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/80 active:scale-95",
                FONT_SIZE_CLASS[gridSize],
                // Completed state
                cell.completed
                  ? "bg-emerald-950/40 text-emerald-400/40 border border-emerald-500/20 shadow-inner scale-[0.97]"
                  : // Wrong flash state
                  cell.wrongFlash
                  ? "bg-red-500/30 text-red-200 border-2 border-red-500 animate-bounce shadow-lg shadow-red-500/30"
                  : // Normal state
                    "bg-gradient-to-b from-secondary/80 to-secondary/40 text-foreground border border-border/60 shadow-md hover:border-amber-500/50 hover:bg-amber-500/10 hover:shadow-amber-500/10 hover:-translate-y-0.5"
              )}
            >
              {cell.completed ? (
                <Check className="w-5 h-5 opacity-40" />
              ) : (
                <span>{cell.number}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Countdown Overlay */}
      {gameState === "countdown" && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
          <span className="text-7xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 animate-pulse">
            {countdown}
          </span>
          <p className="text-sm font-semibold text-muted-foreground mt-4 tracking-wider uppercase">
            Get Ready...
          </p>
        </div>
      )}

      {/* Idle / Start Overlay */}
      {gameState === "idle" && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/75 backdrop-blur-md p-6 text-center animate-in fade-in duration-300">
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-4 shadow-xl">
            <Play className="w-12 h-12 text-amber-400 translate-x-0.5" />
          </div>
          <h3 className="text-2xl font-bold tracking-tight mb-2">Schulte Table</h3>
          <p className="text-sm text-muted-foreground max-w-xs mb-6">
            Click numbers in order as fast as possible. Train peripheral vision & focus!
          </p>
          <Button
            size="lg"
            onClick={onStartGame}
            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-black font-extrabold px-8 shadow-lg shadow-amber-500/25 transition-transform hover:scale-105"
          >
            <Play className="w-5 h-5 mr-2 fill-current" />
            Start Game
          </Button>
        </div>
      )}
    </div>
  );
}
