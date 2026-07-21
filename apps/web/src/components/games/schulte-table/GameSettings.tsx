"use client";

import { Button } from "@/components/ui/button";
import { GridSize, OrderDirection, GameState } from "@/lib/games/schulte-table/types";
import { ArrowUp, ArrowDown, LayoutGrid } from "lucide-react";

interface GameSettingsProps {
  gridSize: GridSize;
  orderDirection: OrderDirection;
  gameState: GameState;
  onGridSizeChange: (size: GridSize) => void;
  onOrderDirectionChange: (dir: OrderDirection) => void;
}

const GRID_OPTIONS: { size: GridSize; label: string; count: string }[] = [
  { size: 3, label: "3x3", count: "1-9" },
  { size: 4, label: "4x4", count: "1-16" },
  { size: 5, label: "5x5", count: "1-25 (Klasyczna)" },
  { size: 6, label: "6x6", count: "1-36" },
];

export function GameSettings({
  gridSize,
  orderDirection,
  gameState,
  onGridSizeChange,
  onOrderDirectionChange,
}: GameSettingsProps) {
  const isPlaying = gameState === "playing" || gameState === "countdown";

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full max-w-2xl bg-card/40 backdrop-blur border border-border/50 rounded-xl p-4 shadow-sm">
      {/* Grid Size Selection */}
      <div className="flex flex-col gap-1.5 w-full sm:w-auto">
        <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
          <LayoutGrid className="w-3.5 h-3.5 text-amber-500" /> Rozmiar siatki
        </span>
        <div className="flex items-center gap-1.5 flex-wrap">
          {GRID_OPTIONS.map((opt) => (
            <Button
              key={opt.size}
              type="button"
              variant={gridSize === opt.size ? "default" : "outline"}
              size="sm"
              disabled={isPlaying}
              onClick={() => onGridSizeChange(opt.size)}
              className={
                gridSize === opt.size
                  ? "bg-amber-500 hover:bg-amber-600 text-black font-bold shadow-md shadow-amber-500/20"
                  : "hover:border-amber-500/40"
              }
            >
              {opt.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Direction Selection */}
      <div className="flex flex-col gap-1.5 w-full sm:w-auto">
        <span className="text-xs font-semibold text-muted-foreground">Kierunek liczenia</span>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant={orderDirection === "asc" ? "default" : "outline"}
            size="sm"
            disabled={isPlaying}
            onClick={() => onOrderDirectionChange("asc")}
            className={
              orderDirection === "asc"
                ? "bg-violet-600 hover:bg-violet-700 text-white font-semibold shadow-md shadow-violet-500/20"
                : "hover:border-violet-500/40"
            }
          >
            <ArrowUp className="w-3.5 h-3.5 mr-1" />
            Do góry (1 → N)
          </Button>

          <Button
            type="button"
            variant={orderDirection === "desc" ? "default" : "outline"}
            size="sm"
            disabled={isPlaying}
            onClick={() => onOrderDirectionChange("desc")}
            className={
              orderDirection === "desc"
                ? "bg-cyan-600 hover:bg-cyan-700 text-white font-semibold shadow-md shadow-cyan-500/20"
                : "hover:border-cyan-500/40"
            }
          >
            <ArrowDown className="w-3.5 h-3.5 mr-1" />
            W dół (N → 1)
          </Button>
        </div>
      </div>
    </div>
  );
}
