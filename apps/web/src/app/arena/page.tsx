"use client";

import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { BackgroundGradients } from "@/components/home";
import { ArenaAuthDialog } from "@/components/auth";
import {
  ArenaHeader,
  ArenaModes,
  LiveFeed,
  LiveFeedContent,
  MatchmakingOverlay,
  CombatRulesCard,
  RankSystemCard,
  SectionHeader,
  GameTypeSelector,
  GameTypeId,
} from "@/components/arena";
import { useArena } from "@/hooks/use-arena";
import { useDuel } from "@/hooks/use-duel";
import { useAuthStore } from "@/store/auth.store";

const ArenaPageContent = () => {
  // Game type selector state
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [selectedArenaMode, setSelectedArenaMode] = useState("");
  const [selectedGameType, setSelectedGameType] = useState("");

  const { isSearching, match, joinQueue, leaveQueue } = useArena();
  const { setPickerOpen } = useDuel();

  // Called when user clicks "Enter Arena" on a mode card
  const handleModeSelect = (arenaMode: string) => {
    if (arenaMode === "Private Duel") {
      setPickerOpen(true);
      return;
    }
    setSelectedArenaMode(arenaMode);
    setSelectorOpen(true);
  };

  // Called when user selects a game type and confirms
  const handleGameTypeSelect = (gameType: GameTypeId) => {
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
    <>
      <main className="container relative mx-auto px-4 py-8 md:px-8 max-w-7xl">
        <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <ArenaHeader />

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column: Modes */}
            <div className="flex-2 space-y-8">
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
    </>
  );
};

const ArenaPagePreview = () => {
  const handlePreviewJoin = () => undefined;

  return (
    <main className="container relative mx-auto px-4 py-8 md:px-8 max-w-7xl">
      <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <ArenaHeader />

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-2 space-y-8">
            <SectionHeader
              title="Available Arenas"
              description="Select your battlefield and start competing."
            />
            <ArenaModes
              onJoin={handlePreviewJoin}
              queueCount={0}
              realtimeQueueCount={false}
            />
            <CombatRulesCard />
          </div>

          <div className="lg:flex-1 space-y-8">
            <LiveFeedContent liveGames={[]} />
            <RankSystemCard />
          </div>
        </div>
      </div>
    </main>
  );
};

export default function ArenaPage() {
  const { isAuthenticated, isHydrated } = useAuthStore();
  const shouldShowAuthDialog = isHydrated && !isAuthenticated;
  const shouldRenderArenaContent = isHydrated && isAuthenticated;
  const shouldBlurArena = !shouldRenderArenaContent;

  return (
    <div className="relative min-h-screen bg-[#050505]">
      <BackgroundGradients />
      <Navbar />

      <div
        aria-hidden={shouldShowAuthDialog}
        inert={shouldBlurArena ? true : undefined}
        className={
          shouldBlurArena
            ? "pointer-events-none select-none blur-[2px] transition-all duration-300"
            : "transition-all duration-300"
        }
      >
        {shouldRenderArenaContent ? <ArenaPageContent /> : <ArenaPagePreview />}
      </div>
      <ArenaAuthDialog open={shouldShowAuthDialog} />
    </div>
  );
}
