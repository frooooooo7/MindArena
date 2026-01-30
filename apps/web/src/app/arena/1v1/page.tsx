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
} from "@/components/arena/game";
import { X } from "lucide-react";

export default function Arena1v1Page() {
  const {
    // Match info
    match,
    user,
    // Game state
    gameStatus,
    countdown,
    level,
    sequence,
    gridSize,
    opponentProgress,
    isWinner,
    gameResult,
    matchCancelled,
    // Local UI state
    showingSequence,
    activeCell,
    clickedCell,
    playerIndex,
    waitingForOpponent,
    // Actions
    handleCellClick,
    handleBackToArena,
  } = useSequenceGame1v1();

  if (!match) return null;

  const isGameActive = gameStatus === "playing" || gameStatus === "finished";

  return (
    <div className="relative min-h-screen bg-background">
      <BackgroundGradients />
      <Navbar />

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
            <PlayerCard
              name={user?.name || "You"}
              avatar={user?.name?.charAt(0).toUpperCase()}
              progress={playerIndex}
              total={sequence.length}
              variant="player"
            />

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
                  total={sequence.length}
                />
              )}
            </div>

            <PlayerCard
              name={match.opponent.name}
              avatar={match.opponent.avatar}
              progress={opponentProgress}
              total={sequence.length}
              variant="opponent"
            />
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
    </div>
  );
}
