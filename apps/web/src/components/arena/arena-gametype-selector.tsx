"use client";

import { useState } from "react";
import { X, Play, Trophy, Zap } from "lucide-react";
import { GAME_TYPES, GameTypeId } from "@/lib/games/game-types";

// Re-export for backward compatibility
export type { GameTypeId } from "@/lib/games/game-types";

interface GameTypeSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (gameType: GameTypeId, arenaMode: string) => void;
    arenaMode: string;
}

export function GameTypeSelector({ isOpen, onClose, onSelect, arenaMode }: GameTypeSelectorProps) {
    const [selectedGame, setSelectedGame] = useState<GameTypeId | null>(null);

    if (!isOpen) return null;

    const handleConfirm = () => {
        if (selectedGame) {
            onSelect(selectedGame, arenaMode);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80">
            {/* Main container - using project's color scheme */}
            <div className="relative w-full max-w-2xl mx-4 p-8 rounded-[2rem] border border-border/40 bg-gradient-to-br from-indigo-600/10 to-violet-600/10 backdrop-blur-xl shadow-2xl">
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 text-muted-foreground transition-colors z-10"
                >
                    <X className="h-5 w-5" />
                </button>

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-lg mb-4">
                        <Trophy className="h-6 w-6" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight mb-1">Select Your Challenge</h2>
                    <p className="text-xs font-bold text-violet-500 uppercase tracking-tighter">
                        {arenaMode}
                    </p>
                </div>

                {/* Game Options */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    {GAME_TYPES.map((game) => {
                        const isSelected = selectedGame === game.id;
                        const Icon = game.icon;
                        
                        return (
                            <button
                                key={game.id}
                                onClick={() => setSelectedGame(game.id as GameTypeId)}
                                className={`
                                    group relative p-6 rounded-[1.5rem] border text-left transition-all duration-200 overflow-hidden
                                    ${isSelected 
                                        ? 'border-violet-500/60 bg-violet-500/15' 
                                        : 'border-border/40 bg-card/50 hover:border-violet-500/40 hover:bg-card/70'
                                    }
                                `}
                            >
                                {/* Color splash */}
                                <div className={`absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 h-24 w-24 bg-gradient-to-br ${game.color} opacity-10 rounded-full pointer-events-none transition-opacity ${isSelected ? 'opacity-20' : ''}`} />

                                {/* Selected indicator */}
                                {isSelected && (
                                    <div className="absolute top-3 right-3 h-2.5 w-2.5 rounded-full bg-violet-500" />
                                )}

                                {/* Icon */}
                                <div className={`relative inline-flex p-3 rounded-xl mb-4 bg-gradient-to-br ${game.color} text-white shadow-lg`}>
                                    <Icon className="h-5 w-5" />
                                </div>

                                {/* Title */}
                                <h3 className="relative text-lg font-bold tracking-tight mb-1">{game.name}</h3>
                                
                                {/* Description */}
                                <p className="relative text-xs text-muted-foreground leading-relaxed mb-3">
                                    {game.description}
                                </p>

                                {/* Stats */}
                                <div className="relative flex items-center gap-2 text-[10px] text-muted-foreground/70">
                                    <span className="flex items-center gap-1">
                                        <Zap className="h-3 w-3" />
                                        {game.difficulty}
                                    </span>
                                    <span>•</span>
                                    <span>{game.averageTime}</span>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Confirm Button - matching arena-modes style */}
                <button 
                    onClick={handleConfirm}
                    disabled={!selectedGame}
                    className={`
                        w-full h-12 rounded-xl font-bold uppercase tracking-wider text-xs transition-all duration-200
                        ${selectedGame 
                            ? 'bg-violet-600/10 text-violet-400 hover:bg-violet-600 hover:text-white border border-violet-500/20 hover:border-violet-500 shadow-sm' 
                            : 'bg-card/30 text-muted-foreground/50 border border-border/40 cursor-not-allowed'
                        }
                    `}
                >
                    <span className="flex items-center justify-center gap-2">
                        {selectedGame ? (
                            <>
                                Find Match
                                <Play className="h-3 w-3 fill-current" />
                            </>
                        ) : (
                            'Select a game to continue'
                        )}
                    </span>
                </button>
            </div>
        </div>
    );
}
