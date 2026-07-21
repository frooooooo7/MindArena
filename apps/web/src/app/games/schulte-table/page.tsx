"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/home/footer";
import {
  GameHeader,
  GameSettings,
  SchulteGrid,
  GameControls,
  GameOverDialog,
} from "@/components/games/schulte-table";
import { useSchulteTable } from "@/lib/games/schulte-table";
import { SlidersHorizontal, Activity, ChevronUp, ChevronDown } from "lucide-react";

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

  const [showSettings, setShowSettings] = useState(true);
  const gameAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  // Smooth scroll game area to center of viewport when game starts
  useEffect(() => {
    if (gameState === "countdown" || gameState === "playing") {
      gameAreaRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [gameState]);

  const isPlaying = gameState === "playing" || gameState === "countdown";

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 pb-20 sm:pb-28">
        <section className="portal-section pt-8 sm:pt-12">
          <div className="flex flex-col items-center gap-6">
            {/* Title */}
            <div className="text-center max-w-xl">
              <h1 className="font-display text-3xl font-extrabold uppercase tracking-tight text-foreground sm:text-5xl">
                Schulte <span className="text-amber-400">Table</span>
              </h1>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                Scan the grid and tap numbers in order as fast as possible. Trains peripheral vision, visual ingestion, and selective focus under time pressure.
              </p>
            </div>

            {/* Collapsible Settings - Auto hides during gameplay */}
            <AnimatePresence>
              {!isPlaying && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="w-full max-w-xl overflow-hidden"
                >
                  <div className="flex items-center justify-between mb-2 px-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <SlidersHorizontal className="size-3.5 text-amber-400" /> Game Settings
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowSettings(!showSettings)}
                      className="text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1"
                    >
                      {showSettings ? "Hide Options" : "Show Options"}
                      {showSettings ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                    </button>
                  </div>

                  {showSettings && (
                    <GameSettings
                      gridSize={gridSize}
                      orderDirection={orderDirection}
                      gameState={gameState}
                      onGridSizeChange={changeGridSize}
                      onOrderDirectionChange={changeOrderDirection}
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Active Game Area Container (Auto Centered) */}
            <div ref={gameAreaRef} className="w-full flex flex-col items-center gap-6 scroll-mt-24">
              {/* Game Header Stats Bar */}
              <GameHeader
                gridSize={gridSize}
                orderDirection={orderDirection}
                currentNumber={currentNumber}
                elapsedMs={elapsedMs}
                mistakes={mistakes}
                bestTime={bestTime}
              />

              {/* Schulte Grid Board */}
              <SchulteGrid
                cells={cells}
                gridSize={gridSize}
                gameState={gameState}
                countdown={countdown}
                onCellClick={handleCellClick}
                onStartGame={startGame}
              />
            </div>

            {/* Controls */}
            <GameControls
              gameState={gameState}
              onStartGame={startGame}
              onResetGame={resetGame}
            />
          </div>
        </section>
      </main>

      {/* Game Over Dialog */}
      <GameOverDialog
        open={gameState === "completed"}
        stats={lastStats}
        gridSize={gridSize}
        orderDirection={orderDirection}
        onPlayAgain={startGame}
        onClose={resetGame}
      />

      <Footer />
    </div>
  );
}
