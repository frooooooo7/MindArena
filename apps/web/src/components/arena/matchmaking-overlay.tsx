"use client";

import { useArena } from "@/hooks/use-arena";
import { X, Swords, Shield, Target } from "lucide-react";
import { useEffect, useState } from "react";

interface MatchmakingOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    gameType?: string;
}

export function MatchmakingOverlay({ isOpen, onClose, gameType = "Sequence" }: MatchmakingOverlayProps) {
    const { isSearching, match } = useArena();
    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isSearching) {
            interval = setInterval(() => setSeconds(s => s + 1), 1000);
        } else {
            setSeconds(0);
        }
        return () => clearInterval(interval);
    }, [isSearching]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="relative w-full max-w-lg p-8 rounded-[2.5rem] border border-violet-500/20 bg-card/80 shadow-2xl overflow-hidden">
                {/* Background glow */}
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 h-64 w-64 bg-violet-600/15 rounded-full pointer-events-none" />
                
                <button 
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 rounded-full hover:bg-secondary/50 text-muted-foreground transition-colors z-10"
                >
                    <X className="h-5 w-5" />
                </button>

                {!match ? (
                    <div className="relative flex flex-col items-center py-8">
                        {/* Radar Animation */}
                        <div className="relative h-48 w-48 mb-10">
                            <div className="absolute inset-0 rounded-full border border-violet-500/20" />
                            <div className="absolute inset-4 rounded-full border border-violet-500/10" />
                            <div className="absolute inset-12 rounded-full border border-violet-500/5" />
                            
                            {/* Scanning line */}
                            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-600/0 via-violet-600/20 to-violet-600/0 animate-[spin_3s_linear_infinite]" />
                            
                            {/* Central brain icon */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Swords className="h-10 w-10 text-violet-500 animate-pulse" />
                            </div>

                            {/* Ping dots */}
                            <div className="absolute top-10 left-10 h-2 w-2 bg-violet-400 rounded-full animate-ping" />
                            <div className="absolute bottom-12 right-6 h-2 w-2 bg-indigo-400 rounded-full animate-ping [animation-delay:1s]" />
                        </div>

                        <div className="text-center space-y-3">
                            <h2 className="text-2xl font-bold tracking-tight">Searching for Opponent</h2>
                            <p className="text-sm text-muted-foreground uppercase tracking-widest font-bold">
                                {gameType} Arena • {Math.floor(seconds / 60)}:{(seconds % 60).toString().padStart(2, '0')}
                            </p>
                            <div className="flex items-center justify-center gap-4 pt-4">
                                <span className="flex items-center gap-1.5 text-xs font-semibold text-violet-400 bg-violet-500/10 px-3 py-1.5 rounded-full border border-violet-500/20">
                                    <Target className="h-3 w-3" />
                                    Finding Tier: Quantum
                                </span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="relative py-8 animate-in zoom-in-95 duration-500">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="inline-flex p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 mb-4 animate-bounce">
                                <Shield className="h-8 w-8" />
                            </div>
                            <h2 className="text-3xl font-black italic uppercase tracking-tighter">Match Found!</h2>
                        </div>

                        {/* Players Grid */}
                        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 mb-8 px-4">
                            {/* You */}
                            <div className="flex flex-col items-center gap-3">
                                <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-xl shadow-violet-500/30 border-2 border-violet-400/30">
                                    <span className="text-2xl font-black text-white">YOU</span>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-bold">You</p>
                                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Master</p>
                                </div>
                            </div>

                            {/* VS Divider */}
                            <div className="flex flex-col items-center justify-center">
                                <div className="h-12 w-12 rounded-full bg-secondary/50 border border-border/40 flex items-center justify-center">
                                    <Swords className="h-5 w-5 text-violet-500" />
                                </div>
                                <span className="text-xs font-black text-muted-foreground mt-2 uppercase tracking-widest">VS</span>
                            </div>

                            {/* Opponent */}
                            <div className="flex flex-col items-center gap-3">
                                <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center shadow-xl border-2 border-indigo-500/30">
                                    <span className="text-2xl font-black text-indigo-400">
                                        {match.opponent.avatar || match.opponent.name[0].toUpperCase()}
                                    </span>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-bold text-indigo-400">{match.opponent.name}</p>
                                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Rank #{match.opponent.rank}</p>
                                </div>
                            </div>
                        </div>

                        {/* Enter Combat Button */}
                        <button className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-black uppercase tracking-widest shadow-xl shadow-violet-500/25 hover:scale-[1.02] transition-transform duration-200">
                            Enter Combat
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
