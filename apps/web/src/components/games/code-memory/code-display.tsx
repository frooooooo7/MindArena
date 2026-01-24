"use client";

import { cn } from "@/lib/utils";
import type { GameState } from "@/lib/games/code-memory";

interface CodeDisplayProps {
  code: string;
  gameState: GameState;
}

export function CodeDisplay({ code, gameState }: CodeDisplayProps) {
  const showCode = gameState === "memorize" || gameState === "gameover";
  
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-2 sm:gap-3">
        {code.split("").map((char, index) => (
          <div
            key={index}
            className={cn(
              "w-12 h-14 sm:w-16 sm:h-20 rounded-xl flex items-center justify-center text-2xl sm:text-3xl font-mono font-bold transition-all duration-300",
              showCode
                ? "bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30"
                : "bg-muted border-2 border-dashed border-border"
            )}
          >
            {showCode ? char : "?"}
          </div>
        ))}
      </div>
      
      {gameState === "memorize" && (
        <p className="text-sm text-muted-foreground animate-pulse">
          Memorizing...
        </p>
      )}
    </div>
  );
}
