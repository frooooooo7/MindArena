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
    return date.toLocaleDateString("pl-PL", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-6 rounded-2xl border border-border/40 bg-card/60">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Clock className="h-5 w-5 text-violet-500" />
        Recent Games
      </h3>

      {history.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground">
          <Gamepad2 className="h-8 w-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">No games played yet. Start playing to see your history!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((game) => {
            const gameType = getGameTypeById(game.gameType);
            return (
              <div
                key={game.id}
                className="flex items-center justify-between p-4 rounded-xl bg-secondary/20 border border-border/40"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg bg-gradient-to-br ${gameType?.color ?? "from-gray-500 to-gray-600"}`}
                  >
                    {gameType?.icon && <gameType.icon className="h-4 w-4 text-white" />}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{gameType?.name ?? game.gameType}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(game.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-right">
                  <div>
                    <p className="text-sm font-bold">{game.score.toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">Score</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold">Lvl {game.level}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">Level</p>
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-sm font-medium text-muted-foreground">
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
