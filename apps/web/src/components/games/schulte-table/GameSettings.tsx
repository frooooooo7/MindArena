"use client";

import { Button } from "@/components/ui/button";
import { GridSize, OrderDirection, GameState } from "@/lib/games/schulte-table/types";
import { ArrowUp, ArrowDown, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

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
  { size: 5, label: "5x5", count: "1-25 (Classic)" },
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
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-5 shadow-2xl">
      {/* Grid Size Selection */}
      <div className="flex flex-col gap-2 w-full sm:w-auto">
        <span className="text-xs font-bold text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
          <LayoutGrid className="size-3.5 text-amber-400" /> Grid Size
        </span>
        <div className="flex items-center gap-1.5 flex-wrap">
          {GRID_OPTIONS.map((opt) => (
            <button
              key={opt.size}
              type="button"
              disabled={isPlaying}
              onClick={() => onGridSizeChange(opt.size)}
              className={cn(
                "rounded-xl px-3 py-1.5 text-xs font-bold transition-all duration-200",
                gridSize === opt.size
                  ? "bg-amber-400 text-black font-extrabold shadow-[0_0_15px_rgba(251,191,36,0.3)]"
                  : "border border-white/10 bg-white/5 text-muted-foreground hover:border-amber-400/40 hover:text-foreground",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Direction Selection */}
      <div className="flex flex-col gap-2 w-full sm:w-auto">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Order Direction</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={isPlaying}
            onClick={() => onOrderDirectionChange("asc")}
            className={cn(
              "inline-flex items-center rounded-xl px-3 py-1.5 text-xs font-bold transition-all duration-200",
              orderDirection === "asc"
                ? "bg-portal-violet text-white shadow-[0_0_15px_rgba(117,92,255,0.3)]"
                : "border border-white/10 bg-white/5 text-muted-foreground hover:border-portal-violet/40 hover:text-foreground",
            )}
          >
            <ArrowUp className="size-3.5 mr-1" />
            Ascending (1 → N)
          </button>

          <button
            type="button"
            disabled={isPlaying}
            onClick={() => onOrderDirectionChange("desc")}
            className={cn(
              "inline-flex items-center rounded-xl px-3 py-1.5 text-xs font-bold transition-all duration-200",
              orderDirection === "desc"
                ? "bg-portal-blue text-[#07150f] font-extrabold shadow-[0_0_15px_rgba(75,168,255,0.3)]"
                : "border border-white/10 bg-white/5 text-muted-foreground hover:border-portal-blue/40 hover:text-foreground",
            )}
          >
            <ArrowDown className="size-3.5 mr-1" />
            Descending (N → 1)
          </button>
        </div>
      </div>
    </div>
  );
}

