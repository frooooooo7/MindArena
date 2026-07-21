"use client";

import { useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { BackgroundGradients } from "@/components/home";
import {
  GameHeader,
  GameSettings,
  ColorWordDisplay,
  GameControls,
  GameOverDialog,
} from "@/components/games/color-word";
import { useColorWord } from "@/lib/games/color-word";

export default function ColorWordPage() {
  const {
    gameMode,
    ruleMode,
    difficulty,
    gameState,
    countdown,
    currentQuestion,
    score,
    streak,
    timeLeft,
    roundsLeft,
    feverActive,
    bestScore,
    lastStats,
    feedback,
    setGameMode,
    setRuleMode,
    setDifficulty,
    startGame,
    resetGame,
    handleAnswer,
    cleanup,
  } = useColorWord();

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
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl bg-gradient-to-r from-rose-400 via-purple-400 to-indigo-500 bg-clip-text text-transparent">
              Color Word Challenge
            </h1>
            <p className="text-muted-foreground mt-2 text-sm md:text-base">
              Zaznacz kolor czcionki lub treść słowa zależnie od reguły! Trenuj hamowanie reakcji (Efekt Stroopa) oraz elastyczność poznawczą!
            </p>
          </div>

          {/* Game Settings */}
          <GameSettings
            gameMode={gameMode}
            ruleMode={ruleMode}
            difficulty={difficulty}
            gameState={gameState}
            onGameModeChange={setGameMode}
            onRuleModeChange={setRuleMode}
            onDifficultyChange={setDifficulty}
          />

          {/* Game Header */}
          <GameHeader
            score={score}
            streak={streak}
            timeLeft={timeLeft}
            roundsLeft={roundsLeft}
            gameMode={gameMode}
            bestScore={bestScore}
          />

          {/* Main Color Word Display & Answers */}
          <ColorWordDisplay
            question={currentQuestion}
            gameState={gameState}
            countdown={countdown}
            feverActive={feverActive}
            feedback={feedback}
            onAnswer={handleAnswer}
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
        gameMode={gameMode}
        onPlayAgain={startGame}
        onClose={resetGame}
      />
    </div>
  );
}
