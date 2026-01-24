import { Button } from "@/components/ui/button";
import { Play, RotateCcw } from "lucide-react";
import type { GameState } from "@/lib/games/sequence-memory";

interface GameControlsProps {
  gameState: GameState;
  sequenceLength: number;
  playerIndex: number;
  onStart: () => void;
}

const stateMessages: Record<GameState, string> = {
  idle: "Press Start to begin!",
  showing: "Watch the sequence...",
  playing: "Your turn! Repeat the sequence",
  success: "Correct! Next level...",
  gameover: "Game Over!",
};

export function GameControls({
  gameState,
  sequenceLength,
  playerIndex,
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
            {playerIndex + 1} / {sequenceLength}
          </p>
        )}
      </div>

      {/* Start/Restart Button */}
      {(gameState === "idle" || gameState === "gameover") && (
        <Button
          size="lg"
          onClick={onStart}
          className="h-12 px-8 text-base font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/25"
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
