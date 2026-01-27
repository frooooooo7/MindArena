"use client";

import { Activity, TrendingUp } from "lucide-react";

const gameProgress = [
  { name: "Sequence", progress: 85, color: "bg-violet-500", shadow: "shadow-violet-500/40" },
  { name: "Chimp", progress: 62, color: "bg-amber-500", shadow: "shadow-amber-500/40" },
  { name: "Code", progress: 45, color: "bg-cyan-500", shadow: "shadow-cyan-500/40" },
];

export function StatsCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Activity Chart Placeholder */}
      <div className="p-6 rounded-3xl border border-border/40 bg-card/60 shadow-xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-indigo-500" />
            <h3 className="font-bold">Memory Performance</h3>
          </div>
          <span className="text-[10px] font-bold py-1 px-2 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            +14% Performance
          </span>
        </div>
        
        <div className="h-48 flex items-end gap-3 px-2">
          {[40, 70, 45, 90, 65, 80, 55, 100, 75, 85].map((height, i) => (
            <div key={i} className="flex-1 group relative">
              <div 
                className="w-full bg-gradient-to-t from-violet-600/20 to-indigo-600/60 rounded-t-lg hover:to-indigo-500 cursor-pointer transition-colors duration-200"
                style={{ height: `${height}%` }}
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-indigo-600 text-white text-[10px] font-bold py-1 px-2 rounded shadow-lg whitespace-nowrap">
                  Score: {height * 123}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-4 px-2">
          <span className="text-[10px] font-bold text-muted-foreground uppercase">Mon</span>
          <span className="text-[10px] font-bold text-muted-foreground uppercase">Sun</span>
        </div>
      </div>

      {/* Game Mastery Bars */}
      <div className="p-6 rounded-3xl border border-border/40 bg-card/60 shadow-xl">
        <div className="mb-8">
          <h3 className="font-bold mb-1">Game Mastery</h3>
          <p className="text-xs text-muted-foreground">Progress towards elite level in each domain</p>
        </div>
        
        <div className="space-y-6">
          {gameProgress.map((game) => (
            <div key={game.name} className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="tracking-wide">{game.name} Memory</span>
                <span className="text-muted-foreground">{game.progress}%</span>
              </div>
              <div className="h-3 w-full bg-secondary/30 rounded-full overflow-hidden border border-border/20">
                <div 
                  className={`h-full ${game.color} ${game.shadow} rounded-full transition-all duration-1000 ease-out shadow-lg`}
                  style={{ width: `${game.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8 p-4 rounded-2xl bg-gradient-to-br from-violet-600/10 to-indigo-600/10 border border-violet-500/20">
          <p className="text-[10px] font-bold text-violet-500 uppercase tracking-widest mb-1">Coach Insight</p>
          <p className="text-xs font-medium leading-relaxed">
            Your <span className="text-violet-500 font-bold">Sequence Memory</span> is reaching top-tier levels. Focus on <span className="text-cyan-500 font-bold">Code Memory</span> to balance your cognitive profile.
          </p>
        </div>
      </div>
    </div>
  );
}
