"use client";

import { Swords, Zap, Trophy, User } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";

export function ArenaHeader() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="relative p-8 md:p-12 rounded-[2.5rem] overflow-hidden border border-violet-500/20 bg-gradient-to-br from-violet-900/50 to-indigo-900/50 shadow-2xl">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 h-96 w-96 bg-violet-600/15 rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 h-64 w-64 bg-indigo-600/15 rounded-full pointer-events-none" />
      
      <div className="relative flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
        <div className="space-y-4 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-bold uppercase tracking-widest">
            <Zap className="h-3 w-3 fill-current" />
            Competitive Arena & Duels
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white italic uppercase">
            The <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">Arena</span>
          </h1>
          <p className="text-lg text-violet-200/60 font-medium">
            Test your cognitive limits. Track your personal high scores and challenge your friends to real-time duels.
          </p>
        </div>

        {/* Player Profile & Duel Stats Card */}
        {user ? (
          <div className="flex flex-col items-center gap-3 bg-white/5 p-6 rounded-3xl border border-white/10 min-w-[240px]">
            <div className="flex items-center gap-2 text-violet-300 text-sm font-bold uppercase tracking-tighter">
              <Swords className="h-4 w-4" />
              Player Profile
            </div>

            <div className="flex flex-col items-center gap-1 my-1">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white font-black text-xl shadow-lg">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="h-full w-full rounded-2xl object-cover" />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </div>
              <span className="text-lg font-black text-white uppercase tracking-tight mt-1">
                {user.name}
              </span>
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 mt-0.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Ready for Duels
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 bg-white/5 p-6 rounded-3xl border border-white/10 min-w-[240px]">
            <div className="flex items-center gap-2 text-violet-300 text-sm font-bold uppercase tracking-tighter">
              <Trophy className="h-4 w-4 text-amber-400" />
              Personal High Scores
            </div>
            <div className="flex flex-col items-center gap-1 text-center">
              <span className="text-4xl mb-1">🧠</span>
              <span className="text-xs font-medium text-violet-200/70 max-w-[180px]">
                Sign in to track your personal high scores and duel stats
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
