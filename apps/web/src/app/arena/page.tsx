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
    SectionHeader,
    GameTypeSelector,
    GameTypeId
} from "@/components/arena";
import { useArena } from "@/hooks/use-arena";

export default function ArenaPage() {
    // Game type selector state
    const [selectorOpen, setSelectorOpen] = useState(false);
    const [selectedArenaMode, setSelectedArenaMode] = useState("");
    const [selectedGameType, setSelectedGameType] = useState("");
    
    const { isSearching, match, joinQueue, leaveQueue } = useArena();

    // Called when user clicks "Enter Arena" on a mode card
    const handleModeSelect = (arenaMode: string) => {
        setSelectedArenaMode(arenaMode);
        setSelectorOpen(true);
    };

    // Called when user selects a game type and confirms
    const handleGameTypeSelect = (gameType: GameTypeId, arenaMode: string) => {
        setSelectedGameType(gameType);
        setSelectorOpen(false);
        // Join queue with game type (e.g., "sequence", "chimp", "code")
        joinQueue(gameType);
    };

    // Close selector without joining
    const handleSelectorClose = () => {
        setSelectorOpen(false);
        setSelectedArenaMode("");
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
                            <ArenaModes onJoin={handleModeSelect} />
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

            {/* Game Type Selector Modal */}
            <GameTypeSelector
                isOpen={selectorOpen}
                onClose={handleSelectorClose}
                onSelect={handleGameTypeSelect}
                arenaMode={selectedArenaMode}
            />

            {/* Matchmaking Overlay */}
            <MatchmakingOverlay 
                isOpen={isSearching || !!match} 
                onClose={leaveQueue} 
                gameType={selectedGameType}
            />
        </div>
    );
}
