"use client";

import { memo } from "react";
import { Loader2, Check } from "lucide-react";

interface LevelCompleteOverlayProps {
  level: number;
  opponentName: string;
  opponentProgress: number;
  total: number;
}

/**
 * Overlay shown when player completes a level and waits for opponent
 */
export const LevelCompleteOverlay = memo(function LevelCompleteOverlay({
  level,
  opponentName,
  opponentProgress,
  total,
}: LevelCompleteOverlayProps) {
  return (
    <div className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <Check className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="text-left">
            <p className="font-bold text-emerald-500">
              Level {level} Complete!
            </p>
            <p className="text-xs text-muted-foreground">
              You finished this round
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Waiting for {opponentName} to finish...</span>
        </div>
        <div className="w-full bg-card/50 rounded-lg p-3 text-center">
          <span className="text-xs text-muted-foreground">
            Opponent progress:{" "}
          </span>
          <span className="font-bold text-foreground">
            {opponentProgress}/{total}
          </span>
        </div>
      </div>
    </div>
  );
});
