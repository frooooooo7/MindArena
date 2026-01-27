"use client";

import { Activity, ShieldCheck, Sword, Zap } from "lucide-react";

const matches = [
  { id: 1, p1: "Neo", p2: "Trinity", game: "Sequence", status: "In Progress", score: "14 - 12" },
  { id: 2, p1: "Morpheus", p2: "Smith", game: "Chimp", status: "Finished", winner: "Morpheus" },
  { id: 3, p1: "Cypher", p2: "Tank", game: "Code", status: "Matching...", score: "0 - 0" },
  { id: 4, p1: "Link", p2: "Niobe", game: "Sequence", status: "Finished", winner: "Link" },
];

export function LiveFeed() {
  return (
    <div className="p-6 md:p-8 rounded-[2rem] border border-border/40 bg-card/20 backdrop-blur-md">
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
        {matches.map((match) => (
          <div key={match.id} className="group p-4 rounded-2xl bg-secondary/10 border border-border/20 hover:border-violet-500/30 transition-all flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
               <div className="flex -space-x-3">
                  <div className="h-10 w-10 rounded-full bg-violet-600 border-2 border-background flex items-center justify-center text-xs font-bold text-white shadow-lg">
                    {match.p1[0]}
                  </div>
                  <div className="h-10 w-10 rounded-full bg-indigo-600 border-2 border-background flex items-center justify-center text-xs font-bold text-white shadow-lg">
                    {match.p2[0]}
                  </div>
               </div>
               <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">{match.p1}</span>
                    <Sword className="h-3 w-3 text-muted-foreground opacity-30" />
                    <span className="text-sm font-bold">{match.p2}</span>
                  </div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{match.game} Memory</p>
               </div>
            </div>

            <div className="flex items-center gap-6">
               <div className="text-center md:text-right">
                  <p className="text-xs font-black italic tracking-tighter">
                    {match.status === "Finished" ? (
                      <span className="text-emerald-500">Won by {match.winner}</span>
                    ) : (
                      <span className="text-violet-500">{match.score}</span>
                    )}
                  </p>
                  <p className="text-[10px] font-bold text-muted-foreground/60 uppercase">{match.status}</p>
               </div>
               <button className="p-2 rounded-xl bg-violet-600 text-white shadow-lg shadow-violet-500/20 hover:scale-105 transition-transform">
                  <Activity className="h-4 w-4" />
               </button>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full mt-6 py-3 rounded-xl border border-dashed border-border/60 text-[10px] font-bold text-muted-foreground uppercase tracking-widest hover:bg-secondary/20 transition-colors">
        View All Active Matches
      </button>
    </div>
  );
}
