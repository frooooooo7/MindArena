"use client";

import { Swords, Trophy, Users, Globe, Lock, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

const modes = [
  {
    title: "Ranked 1v1",
    subtitle: "Climb the Ladder",
    description: "Battle against a similarly skilled opponent. Win to earn RP and climb the global tiers.",
    icon: Trophy,
    color: "from-amber-500 to-orange-600",
    status: "Active",
    participants: "1,240 currently in queue"
  },
  {
    title: "Blitz Tournament",
    subtitle: "Speed is Everything",
    description: "Join a 16-player bracket. Fast-paced memory challenges where only one survives.",
    icon: Zap, // I'll use Swords as fallback or import Zap
    color: "from-violet-500 to-indigo-600",
    status: "Starts in 15m",
    participants: "8/16 registered"
  },
  {
    title: "Private Duel",
    subtitle: "Challenge a Friend",
    description: "Create a custom room and invite your friends for a private cognitive battle.",
    icon: Users,
    color: "from-cyan-500 to-blue-600",
    status: "Ready",
    participants: "Unlimited slots"
  }
];

import { Zap } from "lucide-react";

interface ArenaModesProps {
  onJoin: (gameType: string) => void;
}

export function ArenaModes({ onJoin }: ArenaModesProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {modes.map((mode, i) => (
        <div key={i} className="group relative p-8 rounded-[2rem] border border-border/40 bg-card/50 overflow-hidden hover:border-violet-500/40 transition-colors duration-200 flex flex-col h-full shadow-lg">
          {/* Color splash - simplified */}
          <div className={`absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 h-32 w-32 bg-gradient-to-br ${mode.color} opacity-10 rounded-full pointer-events-none`} />
          
          <div className="relative mb-6">
            <div className={`inline-flex p-3 rounded-2xl bg-gradient-to-br ${mode.color} text-white shadow-lg`}>
              <mode.icon className="h-6 w-6" />
            </div>
          </div>

          <div className="relative flex-1 space-y-2 mb-8">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold tracking-tight">{mode.title}</h3>
              <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-secondary/50 border border-border/40">
                {mode.status}
              </span>
            </div>
            <p className="text-xs font-bold text-violet-500 uppercase tracking-tighter">{mode.subtitle}</p>
            <p className="text-sm text-muted-foreground leading-relaxed pt-2">
              {mode.description}
            </p>
          </div>

          <div className="relative space-y-4">
             <div className="flex items-center gap-2 text-[10px] font-medium text-muted-foreground italic">
                <Globe className="h-3 w-3" />
                {mode.participants}
             </div>
             <Button 
                onClick={() => onJoin(mode.title)}
                className="w-full group/btn relative overflow-hidden h-12 rounded-xl bg-violet-600/10 text-violet-400 hover:bg-violet-600 hover:text-white border border-violet-500/20 hover:border-violet-500 transition-colors duration-200 shadow-sm"
             >
                <span className="relative z-10 flex items-center gap-2 font-bold uppercase tracking-wider text-xs">
                   Enter Arena
                   <Play className="h-3 w-3 fill-current group-hover/btn:translate-x-1 transition-transform" />
                </span>
             </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
