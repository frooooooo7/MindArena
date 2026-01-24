"use client";

import { useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { BackgroundGradients } from "@/components/home";
import { ChimpGrid, GameHeader, GameControls, GameOverDialog } from "@/components/games/chimp-memory";
import { useChimpMemory } from "@/lib/games/chimp-memory";

export default function ChimpMemoryPage() {
  const {
    level,
    cells,
    nextNumber,
    numbersCount,
    gameState,
    startGame,
    handleCellClick,
    cleanup,
  } = useChimpMemory();

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
              Chimp Memory
            </h1>
            <p className="text-muted-foreground mt-2">
              Memorize and click numbers in order
            </p>
          </div>

          {/* Game Header */}
          <GameHeader level={level} numbersCount={numbersCount} nextNumber={nextNumber} />

          {/* Game Grid */}
          <ChimpGrid
            cells={cells}
            disabled={gameState !== "playing"}
            onCellClick={handleCellClick}
          />

          {/* Game Controls */}
          <GameControls
            gameState={gameState}
            nextNumber={nextNumber}
            numbersCount={numbersCount}
            onStart={startGame}
          />
        </div>
      </main>

      {/* Game Over Dialog */}
      <GameOverDialog
        open={gameState === "gameover"}
        level={level}
        numbersCount={numbersCount}
        onPlayAgain={startGame}
      />
    </div>
  );
}
