"use client";

import { useArena } from "@/hooks/use-arena";
import { X, Swords, Shield, Target } from "lucide-react";
import { useEffect, useState, memo } from "react";
import { useRouter } from "next/navigation";

interface MatchmakingOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    gameType?: string;
}

export function MatchmakingOverlay({ isOpen, onClose, gameType = "Sequence" }: MatchmakingOverlayProps) {
    const { isSearching, match } = useArena();
    const [seconds, setSeconds] = useState(0);
    const router = useRouter();

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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80">
            <div className="relative w-full max-w-lg p-8 rounded-3xl border border-violet-500/20 bg-zinc-900/95 shadow-2xl">
                <button 
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 text-zinc-400 transition-colors z-10"
                >
                    <X className="h-5 w-5" />
                </button>

                {!match ? (
                    <SearchingState gameType={gameType} seconds={seconds} />
                ) : (
                    <MatchFoundState match={match} onEnterCombat={() => router.push("/arena/1v1")} />
                )}
            </div>
        </div>
    );
}

// ==========================================
// SEARCHING STATE
// ==========================================

const SearchingState = memo(function SearchingState({ 
    gameType, 
    seconds 
}: { 
    gameType: string; 
    seconds: number;
}) {
    return (
        <div className="relative flex flex-col items-center py-8">
            {/* Simple Radar Animation - CSS only, no JS */}
            <div className="relative h-40 w-40 mb-8">
                <div className="absolute inset-0 rounded-full border border-violet-500/30" />
                <div className="absolute inset-6 rounded-full border border-violet-500/20" />
                <div className="absolute inset-12 rounded-full border border-violet-500/10" />
                
                {/* Scanning line - transform instead of background animation */}
                <div 
                    className="absolute inset-0 rounded-full overflow-hidden"
                    style={{ transform: 'translateZ(0)' }} // Force GPU
                >
                    <div 
                        className="absolute inset-0 bg-gradient-conic from-violet-500/30 via-transparent to-transparent animate-spin"
                        style={{ animationDuration: '3s' }}
                    />
                </div>
                
                {/* Central icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <Swords className="h-8 w-8 text-violet-400" />
                </div>
            </div>

            <div className="text-center space-y-2">
                <h2 className="text-xl font-bold">Searching for Opponent</h2>
                <p className="text-sm text-zinc-500 uppercase tracking-widest font-medium">
                    {gameType} Arena • {Math.floor(seconds / 60)}:{(seconds % 60).toString().padStart(2, '0')}
                </p>
                <div className="flex items-center justify-center gap-4 pt-3">
                    <span className="flex items-center gap-1.5 text-xs font-medium text-violet-400 bg-violet-500/10 px-3 py-1.5 rounded-full">
                        <Target className="h-3 w-3" />
                        Finding Match...
                    </span>
                </div>
            </div>
        </div>
    );
});

// ==========================================
// MATCH FOUND STATE
// ==========================================

interface MatchFoundStateProps {
    match: {
        opponent: {
            name: string;
            avatar?: string;
            rank: number;
        };
    };
    onEnterCombat: () => void;
}

const MatchFoundState = memo(function MatchFoundState({ match, onEnterCombat }: MatchFoundStateProps) {
    return (
        <div className="relative py-6">
            {/* Header - simple pulse, no bounce */}
            <div className="text-center mb-6">
                <div className="inline-flex p-3 rounded-xl bg-emerald-500/15 text-emerald-400 mb-3">
                    <Shield className="h-7 w-7" />
                </div>
                <h2 className="text-2xl font-black uppercase tracking-tight">Match Found!</h2>
            </div>

            {/* Players Grid - optimized, no shadows */}
            <div className="grid grid-cols-3 items-center gap-3 mb-6 px-2">
                {/* You */}
                <div className="flex flex-col items-center gap-2">
                    <div className="h-20 w-20 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
                        <span className="text-xl font-black text-white">YOU</span>
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-bold">You</p>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Ready</p>
                    </div>
                </div>

                {/* VS Divider */}
                <div className="flex flex-col items-center justify-center">
                    <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center">
                        <Swords className="h-4 w-4 text-violet-400" />
                    </div>
                    <span className="text-[10px] font-bold text-zinc-600 mt-1 uppercase">VS</span>
                </div>

                {/* Opponent */}
                <div className="flex flex-col items-center gap-2">
                    <div className="h-20 w-20 rounded-xl bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center border border-indigo-500/30">
                        <span className="text-xl font-black text-indigo-400">
                            {match.opponent.avatar || match.opponent.name[0].toUpperCase()}
                        </span>
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-bold text-indigo-400">{match.opponent.name}</p>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider">
                            Rank #{match.opponent.rank}
                        </p>
                    </div>
                </div>
            </div>

            {/* Enter Combat Button - simple, no heavy shadows */}
            <button 
                onClick={onEnterCombat}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold uppercase tracking-wider hover:brightness-110 transition-all duration-150 active:scale-[0.98]"
            >
                Enter Combat
            </button>
        </div>
    );
});
