"use client";

import { Clock, Gamepad2 } from "lucide-react";
import { GameResult } from "@/lib/game-result-api";
import { getGameTypeById } from "@/lib/games/game-types";

interface GameHistoryListProps {
  history: GameResult[];
}

export function GameHistoryList({ history }: GameHistoryListProps) {
  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-6 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl shadow-xl space-y-4">
      <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
        <Clock className="h-5 w-5 text-portal-mint" />
        <h3 className="font-display text-lg font-bold uppercase tracking-tight text-foreground">
          Recent Games History
        </h3>
      </div>

      {history.length === 0 ? (
        <div className="py-12 text-center rounded-2xl border border-dashed border-white/10 bg-white/[0.01]">
          <Gamepad2 className="h-10 w-10 mx-auto mb-2 opacity-30 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            No practice games played yet. Start playing to see your history!
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {history.map((game) => {
            const gameType = getGameTypeById(game.gameType);
            return (
              <div
                key={game.id}
                className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/10 hover:bg-white/[0.04] transition-all"
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className="p-2.5 rounded-xl bg-portal-mint/15 border border-portal-mint/30 text-portal-mint shadow-md"
                  >
                    {gameType?.icon ? (
                      <gameType.icon className="h-4 w-4" />
                    ) : (
                      <Gamepad2 className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-foreground">
                      {gameType?.name ?? game.gameType}
                    </p>
                    <p className="text-[11px] text-muted-foreground font-mono">
                      {formatDate(game.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-right">
                  <div>
                    <p className="text-sm font-display font-extrabold text-portal-mint">
                      {game.score.toLocaleString()}
                    </p>
                    <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">
                      Score
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">Lvl {game.level}</p>
                    <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">
                      Level
                    </p>
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-xs font-mono text-muted-foreground">
                      {formatDuration(game.duration)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
