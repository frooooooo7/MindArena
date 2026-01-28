"use client";

import { Swords } from "lucide-react";

interface GameHeaderProps {
    gameType: string;
    level: number;
}

export function GameHeader({ gameType, level }: GameHeaderProps) {
    return (
        <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm font-bold uppercase tracking-widest mb-4">
                <Swords className="h-4 w-4" />
                {gameType} Memory - 1v1
            </div>
            <h1 className="text-3xl font-bold">Level {level}</h1>
        </div>
    );
}
