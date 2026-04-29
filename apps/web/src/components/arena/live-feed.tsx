"use client";

import { Activity, Sword, Zap } from "lucide-react";
import { LiveGameInfo } from "@mindarena/shared";

import { useArena } from "@/hooks/use-arena";

interface LiveFeedContentProps {
  liveGames: LiveGameInfo[];
}

export function LiveFeedContent({ liveGames }: LiveFeedContentProps) {
  // Display only 4 latest games
  const displayedGames = liveGames.slice(0, 4);

  return (
    <div className="p-6 md:p-8 rounded-[2rem] border border-border/40 bg-card/40">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Activity className="h-5 w-5 text-emerald-500" />
          <h2 className="text-xl font-bold">Live Arena Feed</h2>
        </div>
        <div className="flex items-center gap-2">
           <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
           </span>
           <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Realtime Activity</span>
        </div>
      </div>

      <div className="space-y-4">
        {displayedGames.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-secondary/10 border border-dashed border-border/20">
            <p className="text-sm text-muted-foreground italic">No ongoing matches at the moment. Join the queue to start one!</p>
          </div>
        ) : (
          displayedGames.map((match) => (
            <div key={match.id} className="group p-4 rounded-2xl bg-secondary/10 border border-border/20 hover:border-violet-500/30 transition-colors duration-200 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                 <div className="flex -space-x-3">
                    <div className="h-10 w-10 rounded-full bg-violet-600 border-2 border-background flex items-center justify-center text-xs font-bold text-white shadow-lg">
                      {match.p1Name[0].toUpperCase()}
                    </div>
                    <div className="h-10 w-10 rounded-full bg-indigo-600 border-2 border-background flex items-center justify-center text-xs font-bold text-white shadow-lg">
                      {match.p2Name[0].toUpperCase()}
                    </div>
                 </div>
                 <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">{match.p1Name}</span>
                      <Sword className="h-3 w-3 text-muted-foreground opacity-30" />
                      <span className="text-sm font-bold">{match.p2Name}</span>
                    </div>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{match.gameType} Memory</p>
                 </div>
              </div>

              <div className="flex items-center gap-6">
                 <div className="text-center md:text-right min-w-[120px]">
                    <p className="text-xs font-black italic tracking-tighter uppercase">
                      {match.status === "finished" ? (
                        <span className="text-emerald-500">Won by {match.winnerName || "Unknown"}</span>
                      ) : match.status === "playing" ? (
                        <span className="text-violet-500 animate-pulse">In Progress</span>
                      ) : (
                        <span className="text-amber-500">Starting...</span>
                      )}
                    </p>
                    <p className="text-[10px] font-bold text-muted-foreground/60 uppercase">
                      {match.status === "finished" ? "Finished" : match.status === "playing" ? "Live" : "Waiting"}
                    </p>
                 </div>
                 <div className="p-2 rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/20">
                    <Zap className="h-4 w-4" />
                 </div>
              </div>
            </div>
          ))
        )}
      </div>

      <button disabled className="w-full mt-6 py-3 rounded-xl border border-dashed border-border/60 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest cursor-not-allowed">
        View All Active Matches · Coming Soon
      </button>
    </div>
  );
}

export function LiveFeed() {
  const { liveGames } = useArena();

  return <LiveFeedContent liveGames={liveGames} />;
}
