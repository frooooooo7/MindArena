"use client";

import { Swords, Trophy, Users } from "lucide-react";

export function ArenaStatsSection() {
  return (
    <div className="space-y-6">
      <div className="p-12 text-center rounded-2xl border border-dashed border-border/60 bg-secondary/5">
        <Swords className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
        <h3 className="text-xl font-semibold mb-2">Arena Statistics Coming Soon</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Track your 1v1 match history, win rate, and competitive ranking. 
          This feature is currently in development.
        </p>
        <div className="flex justify-center gap-4 mt-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Trophy className="h-4 w-4" />
            <span>Ranking System</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>Match History</span>
          </div>
        </div>
      </div>
    </div>
  );
}
