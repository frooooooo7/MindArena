"use client";

import { Button } from "@/components/ui/button";
import { GameState } from "@/lib/games/fast-math/types";
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
          className="border-white/10 bg-white/5 hover:bg-white/10 text-foreground font-semibold shadow-sm rounded-xl"
        >
          <RotateCcw className="size-4 mr-2" />
          Restart Game
        </Button>
      ) : (
        <Button
          onClick={onStartGame}
          className="bg-portal-mint text-[#07150f] font-extrabold shadow-lg shadow-portal-mint/20 hover:bg-portal-mint/90 rounded-xl"
        >
          <Play className="size-4 mr-2 fill-current" />
          Play Again
        </Button>
      )}
    </div>
  );
}
