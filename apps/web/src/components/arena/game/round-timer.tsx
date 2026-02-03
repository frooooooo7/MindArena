"use client";

import { memo } from "react";
import { ROUND_TIME_LIMIT } from "@mindarena/shared";

interface RoundTimerProps {
  timeLeft: number;
}

/**
 * Round Timer Component
 * Full-width progress bar at bottom that shrinks from green → yellow → red
 */
export const RoundTimer = memo(function RoundTimer({
  timeLeft,
}: RoundTimerProps) {
  const progress = (timeLeft / ROUND_TIME_LIMIT) * 100;

  // Color transitions: green (>50%) → yellow (25-50%) → red (<25%)
  const getBarColor = () => {
    if (progress > 50) return "bg-emerald-500";
    if (progress > 25) return "bg-amber-500";
    return "bg-red-500";
  };

  const getGlowColor = () => {
    if (progress > 50) return "shadow-emerald-500/50";
    if (progress > 25) return "shadow-amber-500/50";
    return "shadow-red-500/50";
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pointer-events-none">
      <div className="max-w-6xl mx-auto">
        {/* Background track */}
        <div className="h-2 bg-muted/30 rounded-full overflow-hidden backdrop-blur-sm flex justify-center">
          {/* Animated progress bar - shrinks to center */}
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-linear shadow-lg ${getBarColor()} ${getGlowColor()}`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Time indicator */}
        <div className="flex justify-center mt-2">
          <span
            className={`text-sm font-bold tabular-nums px-3 py-1 rounded-full backdrop-blur-sm ${
              progress > 50
                ? "bg-emerald-500/20 text-emerald-400"
                : progress > 25
                  ? "bg-amber-500/20 text-amber-400"
                  : "bg-red-500/20 text-red-400 animate-pulse"
            }`}
          >
            {timeLeft}s
          </span>
        </div>
      </div>
    </div>
  );
});
