"use client";

import { useSequenceGame1v1 } from "@/hooks/use-sequence-game-1v1";
import { Navbar } from "@/components/navbar";
import { BackgroundGradients } from "@/components/home";
import { GameGrid } from "@/components/games/sequence-memory";
import {
  PlayerCard,
  GameResultModal,
  WaitingState,
  CountdownState,
  GameHeader,
  GameStatusMessage,
  LevelCompleteOverlay,
  RoundTimer,
} from "@/components/arena/game";
import { X } from "lucide-react";
import { useSequenceStore } from "@/store/game/sequence.store";
import { useAuthStore } from "@/store/auth.store";

const GameTimer = () => {
    const timeLeft = useSequenceStore((state) => state.timeLeft);
    return <RoundTimer timeLeft={timeLeft} />;
};

const PlayerProgress = () => {
    const user = useAuthStore((state) => state.user);
    const progress = useSequenceStore((state) => state.currentIndex);
    const total = useSequenceStore((state) => state.sequence.length);
    
    return (
        <PlayerCard
            name={user?.name || "You"}
            avatar={user?.name?.charAt(0).toUpperCase()}
            progress={progress}
            total={total}
            variant="player"
        />
    );
};

const OpponentProgress = () => {
    const match = useSequenceStore((state) => state.match);
    const progress = useSequenceStore((state) => state.opponentProgress);
    const total = useSequenceStore((state) => state.sequence.length);

    if (!match) return null;

    return (
        <PlayerCard
            name={match.opponent.name}
            avatar={match.opponent.avatar}
            progress={progress}
            total={total}
            variant="opponent"
        />
    );
};

const GameArea = ({ handleCellClick, handleBackToArena }: { handleCellClick: (idx: number) => void, handleBackToArena: () => void }) => {
    const gameStatus = useSequenceStore((state) => state.status);
    const matchCancelled = useSequenceStore((state) => state.matchCancelled);
    const match = useSequenceStore((state) => state.match);
    const user = useAuthStore((state) => state.user);
    const countdown = useSequenceStore((state) => state.countdown);
    const level = useSequenceStore((state) => state.level);
    const gridSize = useSequenceStore((state) => state.gridSize);
    
    // Grid state
    const activeCell = useSequenceStore((state) => state.activeCell);
    const clickedCell = useSequenceStore((state) => state.clickedCell);
    const showingSequence = useSequenceStore((state) => state.showingSequence);
    
    // Result state
    const gameResult = useSequenceStore((state) => state.gameResult);
    const isWinner = useSequenceStore((state) => state.isWinner);
    const opponentProgress = useSequenceStore((state) => state.opponentProgress);
    const sequenceLength = useSequenceStore((state) => state.sequence.length);

    const isGameActive = gameStatus === "playing" || gameStatus === "finished" || gameStatus === "level-complete";
    const waitingForOpponent = gameStatus === "level-complete";

    if (!match) return null;

  return (
      <main className="container relative mx-auto px-4 py-8 max-w-5xl">
        <GameHeader gameType={match.gameType} level={level} />

        {matchCancelled ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] animate-in fade-in zoom-in-95 duration-500">
            <div className="p-12 rounded-[2.5rem] border border-red-500/20 bg-card/50 backdrop-blur-xl text-center max-w-md w-full shadow-2xl">
              <div className="h-20 w-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
                <X className="h-10 w-10 text-red-500" />
              </div>
              <h2 className="text-3xl font-black uppercase mb-4 tracking-tighter">
                Match Cancelled
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Your opponent failed to join the arena or has disconnected.
              </p>
              <button
                onClick={handleBackToArena}
                className="w-full py-4 rounded-2xl bg-violet-600 text-white font-bold uppercase tracking-widest hover:bg-violet-700 transition-all active:scale-[0.98] shadow-lg shadow-violet-500/20"
              >
                Back to Arena
              </button>
            </div>
          </div>
        ) : (
          <>
            {gameStatus === "waiting" && (
              <WaitingState message="Waiting for opponent..." />
            )}

            {gameStatus === "countdown" && (
              <CountdownState seconds={countdown} />
            )}
          </>
        )}

        {isGameActive && !matchCancelled && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <PlayerProgress />

            <div className="flex flex-col items-center">
              <GameGrid
                gridSize={gridSize}
                activeCell={activeCell}
                clickedCell={clickedCell}
                disabled={
                  showingSequence ||
                  gameStatus !== "playing" ||
                  waitingForOpponent
                }
                onCellClick={handleCellClick}
              />

              <GameStatusMessage
                showingSequence={showingSequence}
                isPlaying={gameStatus === "playing" && !waitingForOpponent}
              />

              {/* Waiting for opponent overlay */}
              {waitingForOpponent && (
                <LevelCompleteOverlay
                  level={level}
                  opponentName={match.opponent.name}
                  opponentProgress={opponentProgress}
                  total={sequenceLength}
                />
              )}
            </div>

            <OpponentProgress />
          </div>
        )}

        {gameStatus === "finished" && gameResult && (
          <GameResultModal
            isWinner={isWinner ?? false}
            gameResult={gameResult}
            onBackToArena={handleBackToArena}
          />
        )}
      </main>
  );
}

export default function Arena1v1Page() {
  const { handleCellClick, handleBackToArena } = useSequenceGame1v1();
  const match = useSequenceStore((state) => state.match);

  // Initial check to prevent flash of content if no match
  if (!match) return null;

  return (
    <div className="relative min-h-screen bg-background">
      <BackgroundGradients />
      <Navbar />
      <GameArea handleCellClick={handleCellClick} handleBackToArena={handleBackToArena} />
      <GameTimer />
    </div>
  );
}
