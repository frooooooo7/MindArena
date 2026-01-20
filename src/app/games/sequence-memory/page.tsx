"use client";

import { useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { BackgroundGradients } from "@/components/home";
import { GameGrid, GameHeader, GameControls, GameOverDialog } from "@/components/games/sequence-memory";
import { useSequenceMemory } from "@/lib/games/sequence-memory";

export default function SequenceMemoryPage() {
  const {
    level,
    score,
    gridSize,
    gameState,
    activeCell,
    clickedCell,
    playerIndex,
    sequenceLength,
    startGame,
    handleCellClick,
    cleanup,
  } = useSequenceMemory();

  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  return (
    <div className="relative min-h-screen bg-background">
      <BackgroundGradients />
      <Navbar />

      <main className="container relative w-full mx-auto px-4 md:px-8 py-8">
        <div className="flex flex-col items-center gap-8">
          {/* Title */}
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Sequence Memory
            </h1>
            <p className="text-muted-foreground mt-2">
              Remember and repeat the pattern
            </p>
          </div>

          {/* Game Header */}
          <GameHeader level={level} score={score} gridSize={gridSize} />

          {/* Game Grid */}
          <GameGrid
            gridSize={gridSize}
            activeCell={activeCell}
            clickedCell={clickedCell}
            disabled={gameState !== "playing"}
            onCellClick={handleCellClick}
          />

          {/* Game Controls */}
          <GameControls
            gameState={gameState}
            sequenceLength={sequenceLength}
            playerIndex={playerIndex}
            onStart={startGame}
          />
        </div>
      </main>

      {/* Game Over Dialog */}
      <GameOverDialog
        open={gameState === "gameover"}
        level={level}
        score={score}
        gridSize={gridSize}
        onPlayAgain={startGame}
      />
    </div>
  );
}
