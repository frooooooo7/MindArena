import { Button } from "@/components/ui/button";
import { Play, RotateCcw } from "lucide-react";
import type { GameState } from "@/lib/games/chimp-memory";

interface GameControlsProps {
  gameState: GameState;
  nextNumber: number;
  numbersCount: number;
  onStart: () => void;
}

const stateMessages: Record<GameState, string> = {
  idle: "Press Start to begin!",
  memorize: "Memorize the numbers!",
  playing: "Click numbers in order",
  success: "Correct! Next level...",
  gameover: "Game Over!",
};

export function GameControls({
  gameState,
  nextNumber,
  numbersCount,
  onStart,
}: GameControlsProps) {
  const isPlaying = gameState === "playing";
  
  return (
    <div className="flex flex-col items-center gap-4">
      {/* Status Message */}
      <div className="text-center">
        <p className="text-lg font-medium text-foreground">
          {stateMessages[gameState]}
        </p>
        {isPlaying && (
          <p className="text-sm text-muted-foreground mt-1">
            Find number: <span className="font-bold text-amber-500">{nextNumber}</span> of {numbersCount}
          </p>
        )}
      </div>

      {/* Start/Restart Button */}
      {(gameState === "idle" || gameState === "gameover") && (
        <Button
          size="lg"
          onClick={onStart}
          className="h-12 px-8 text-base font-semibold bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-lg shadow-amber-500/25"
        >
          {gameState === "idle" ? (
            <>
              <Play className="mr-2 h-5 w-5" />
              Start Game
            </>
          ) : (
            <>
              <RotateCcw className="mr-2 h-5 w-5" />
              Play Again
            </>
          )}
        </Button>
      )}
    </div>
  );
}
