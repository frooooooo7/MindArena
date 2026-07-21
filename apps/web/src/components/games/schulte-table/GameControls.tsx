"use client";

import { Button } from "@/components/ui/button";
import { GameState } from "@/lib/games/schulte-table/types";
import { RotateCcw, Play } from "lucide-react";

interface GameControlsProps {
  gameState: GameState;
  onStartGame: () => void;
  onResetGame: () => void;
}

export function GameControls({
  gameState,
  onStartGame,
  onResetGame,
}: GameControlsProps) {
  if (gameState === "idle" || gameState === "countdown") {
    return null;
  }

  return (
    <div className="flex items-center gap-3 animate-in fade-in duration-200">
      {gameState === "playing" ? (
        <Button
          variant="outline"
          onClick={onResetGame}
          className="border-amber-500/30 hover:border-amber-500/60 hover:bg-amber-500/10 text-foreground font-semibold shadow-sm"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Restart Game
        </Button>
      ) : (
        <Button
          onClick={onStartGame}
          className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-black font-extrabold shadow-md shadow-amber-500/20"
        >
          <Play className="w-4 h-4 mr-2 fill-current" />
          Play Again
        </Button>
      )}
    </div>
  );
}
