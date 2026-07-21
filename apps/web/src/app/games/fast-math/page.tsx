"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/home/footer";
import {
  GameHeader,
  GameSettings,
  FastMathDisplay,
  GameControls,
  GameOverDialog,
} from "@/components/games/fast-math";
import { useFastMath } from "@/lib/games/fast-math";
import { SlidersHorizontal, ChevronUp, ChevronDown } from "lucide-react";

export default function FastMathPage() {
  const {
    operation,
    difficulty,
    gameMode,
    timePreset,
    equationPreset,
    gameState,
    countdown,
    currentQuestion,
    score,
    streak,
    lives,
    timeLeft,
    equationsLeft,
    bestScore,
    lastStats,
    feedback,
    setOperation,
    setDifficulty,
    setGameMode,
    setTimePreset,
    setEquationPreset,
    startGame,
    resetGame,
    handleAnswer,
    cleanup,
  } = useFastMath();

  const [showSettings, setShowSettings] = useState(true);
  const gameAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

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
                Fast Math <span className="text-portal-mint">Challenge</span>
              </h1>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                Solve rapid mental arithmetic equations under customizable time limits and number ranges. Sharpen calculation speed and numerical focus.
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
                      <SlidersHorizontal className="size-3.5 text-portal-mint" /> Game Settings
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
                      operation={operation}
                      difficulty={difficulty}
                      gameMode={gameMode}
                      timePreset={timePreset}
                      equationPreset={equationPreset}
                      gameState={gameState}
                      onOperationChange={setOperation}
                      onDifficultyChange={setDifficulty}
                      onGameModeChange={setGameMode}
                      onTimePresetChange={setTimePreset}
                      onEquationPresetChange={setEquationPreset}
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Active Game Area Container (Auto Centered) */}
            <div ref={gameAreaRef} className="w-full flex flex-col items-center gap-6 scroll-mt-24">
              {/* Game Header Stats Bar */}
              <GameHeader
                score={score}
                streak={streak}
                timeLeft={timeLeft}
                equationsLeft={equationsLeft}
                lives={lives}
                gameMode={gameMode}
                bestScore={bestScore}
              />

              {/* Main Fast Math Display & Answers */}
              <FastMathDisplay
                question={currentQuestion}
                gameState={gameState}
                countdown={countdown}
                feedback={feedback}
                onAnswer={handleAnswer}
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
        onPlayAgain={startGame}
        onClose={resetGame}
      />

      <Footer />
    </div>
  );
}
