"use client";

import { Swords, Zap, Timer } from "lucide-react";

export function ArenaHeader() {
  return (
    <div className="relative p-8 md:p-12 rounded-[2.5rem] overflow-hidden border border-violet-500/20 bg-gradient-to-br from-violet-900/40 to-indigo-900/40 backdrop-blur-md shadow-2xl">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 h-96 w-96 bg-violet-600/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 h-64 w-64 bg-indigo-600/20 rounded-full blur-[80px] pointer-events-none" />
      
      <div className="relative flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
        <div className="space-y-4 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-bold uppercase tracking-widest">
            <Zap className="h-3 w-3 fill-current" />
            Season 4: Cognitive Rise
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white italic uppercase">
            The <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">Arena</span>
          </h1>
          <p className="text-lg text-violet-200/60 font-medium">
            Test your cognitive limits against the world. Climb the ranks, earn legendary status, and claim your place among the elite.
          </p>
        </div>

        <div className="flex flex-col items-center gap-4 bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-sm min-w-[240px]">
           <div className="flex items-center gap-2 text-violet-300 text-sm font-bold uppercase tracking-tighter">
              <Timer className="h-4 w-4" />
              Season Ends In
           </div>
           <div className="flex gap-4">
              <div className="text-center">
                 <p className="text-3xl font-black text-white">04</p>
                 <p className="text-[10px] uppercase font-bold text-violet-400/60">Days</p>
              </div>
              <div className="text-center border-l border-white/10 pl-4">
                 <p className="text-3xl font-black text-white">12</p>
                 <p className="text-[10px] uppercase font-bold text-violet-400/60">Hours</p>
              </div>
              <div className="text-center border-l border-white/10 pl-4">
                 <p className="text-3xl font-black text-white">45</p>
                 <p className="text-[10px] uppercase font-bold text-violet-400/60">Mins</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
