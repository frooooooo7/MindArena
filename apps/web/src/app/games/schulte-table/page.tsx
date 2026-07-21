"use client";

import { useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { BackgroundGradients } from "@/components/home";
import {
  GameHeader,
  GameSettings,
  SchulteGrid,
  GameControls,
  GameOverDialog,
} from "@/components/games/schulte-table";
import { useSchulteTable } from "@/lib/games/schulte-table";

export default function SchulteTablePage() {
  const {
    gridSize,
    orderDirection,
    gameState,
    countdown,
    cells,
    currentNumber,
    elapsedMs,
    mistakes,
    bestTime,
    lastStats,
    startGame,
    resetGame,
    handleCellClick,
    changeGridSize,
    changeOrderDirection,
    cleanup,
  } = useSchulteTable();

  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  return (
    <div className="relative min-h-screen bg-background">
      <BackgroundGradients />
      <Navbar />

      <main className="container relative w-full mx-auto px-4 md:px-8 py-8">
        <div className="flex flex-col items-center gap-6">
          {/* Title Section */}
          <div className="text-center max-w-xl">
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-transparent">
              Schulte Table
            </h1>
            <p className="text-muted-foreground mt-2 text-sm md:text-base">
              Znajduj i klikaj liczby w odpowiedniej kolejności jak najszybciej.
              Trenuj koncentrację, peryferyjne widzenie i szybkość reakcji!
            </p>
          </div>

          {/* Game Settings */}
          <GameSettings
            gridSize={gridSize}
            orderDirection={orderDirection}
            gameState={gameState}
            onGridSizeChange={changeGridSize}
            onOrderDirectionChange={changeOrderDirection}
          />

          {/* Game Header */}
          <GameHeader
            gridSize={gridSize}
            orderDirection={orderDirection}
            currentNumber={currentNumber}
            elapsedMs={elapsedMs}
            mistakes={mistakes}
            bestTime={bestTime}
          />

          {/* Schulte Grid */}
          <SchulteGrid
            cells={cells}
            gridSize={gridSize}
            gameState={gameState}
            countdown={countdown}
            onCellClick={handleCellClick}
            onStartGame={startGame}
          />

          {/* Controls */}
          <GameControls
            gameState={gameState}
            onStartGame={startGame}
            onResetGame={resetGame}
          />
        </div>
      </main>

      {/* Game Over / Victory Dialog */}
      <GameOverDialog
        open={gameState === "completed"}
        stats={lastStats}
        gridSize={gridSize}
        orderDirection={orderDirection}
        onPlayAgain={startGame}
        onClose={resetGame}
      />
    </div>
  );
}
