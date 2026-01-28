"use client";

import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { BackgroundGradients } from "@/components/home";
import { 
    ArenaHeader, 
    ArenaModes, 
    LiveFeed, 
    MatchmakingOverlay,
    CombatRulesCard,
    RankSystemCard,
    SectionHeader
} from "@/components/arena";
import { useArena } from "@/hooks/use-arena";

export default function ArenaPage() {
    const [selectedGame, setSelectedGame] = useState("");
    const { isSearching, match, joinQueue, leaveQueue } = useArena();

    const handleJoinQueue = (gameType: string) => {
        setSelectedGame(gameType);
        joinQueue(gameType);
    };

    return (
        <div className="relative min-h-screen bg-[#050505]">
            <BackgroundGradients />
            <Navbar />

            <main className="container relative mx-auto px-4 py-8 md:px-8 max-w-7xl">
                <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <ArenaHeader />

                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Left Column: Modes */}
                        <div className="flex-[2] space-y-8">
                            <SectionHeader 
                                title="Available Arenas" 
                                description="Select your battlefield and start competing." 
                            />
                            <ArenaModes onJoin={handleJoinQueue} />
                            <CombatRulesCard />
                        </div>

                        {/* Right Column: Feed & Info */}
                        <div className="lg:flex-1 space-y-8">
                            <LiveFeed />
                            <RankSystemCard />
                        </div>
                    </div>
                </div>
            </main>

            <MatchmakingOverlay 
                isOpen={isSearching || !!match} 
                onClose={leaveQueue} 
                gameType={selectedGame}
            />
        </div>
    );
}
