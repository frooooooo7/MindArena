"use client";

import { Target, TrendingUp, Users } from "lucide-react";

export function RankCard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="p-6 rounded-3xl border border-border/40 bg-gradient-to-br from-violet-600 to-indigo-700 text-white shadow-2xl shadow-violet-500/20 relative overflow-hidden group">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 h-32 w-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
        
        <div className="relative flex items-center justify-between mb-6">
          <div className="p-2 rounded-xl bg-white/20">
            <Target className="h-6 w-6" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Global Rank</span>
        </div>
        
        <div className="relative">
          <p className="text-4xl font-black italic">#1,245</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded">+42 today</span>
            <span className="text-[10px] font-medium opacity-80 italic">Top 8.4%</span>
          </div>
        </div>
      </div>

      <div className="p-6 rounded-3xl border border-border/40 bg-card/30 backdrop-blur-md shadow-xl group hover:border-violet-500/40 transition-colors">
        <div className="flex items-center justify-between mb-6">
          <div className="p-2 rounded-xl bg-violet-600/10 text-violet-600">
            <Users className="h-6 w-6" />
          </div>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Active Players</span>
        </div>
        
        <div>
          <p className="text-4xl font-bold tracking-tight">14,802</p>
          <p className="text-xs text-muted-foreground mt-2 font-medium">Currently competing in arena</p>
        </div>
      </div>

      <div className="p-6 rounded-3xl border border-border/40 bg-card/30 backdrop-blur-md shadow-xl group hover:border-emerald-500/40 transition-colors">
        <div className="flex items-center justify-between mb-6">
          <div className="p-2 rounded-xl bg-emerald-600/10 text-emerald-600">
            <TrendingUp className="h-6 w-6" />
          </div>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Weekly Streak</span>
        </div>
        
        <div>
          <p className="text-4xl font-bold tracking-tight text-emerald-600">12 Days</p>
          <p className="text-xs text-muted-foreground mt-2 font-medium">Double XP multiplier active!</p>
        </div>
      </div>
    </div>
  );
}
