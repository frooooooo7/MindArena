"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Brain, Trophy, Hash } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { BackgroundGradients } from "@/components/home";
import { Button } from "@/components/ui/button";
import { CodeDisplay, CodeInput, GameOverDialog } from "@/components/games/code-memory";
import { useCodeMemory } from "@/lib/games/code-memory";

export default function CodeMemoryPage() {
  const {
    level,
    code,
    codeLength,
    userInput,
    gameState,
    score,
    startGame,
    handleSubmit,
    handleInputChange,
    cleanup,
  } = useCodeMemory();

  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  const isIdle = gameState === "idle";

  return (
    <div className="relative min-h-screen bg-background">
      <BackgroundGradients />
      <Navbar />

      <main className="container relative w-full mx-auto px-4 md:px-8 py-8">
        <div className="flex flex-col items-center gap-8">
          {/* Title */}
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Code Memory
            </h1>
            <p className="text-muted-foreground mt-2">
              Memorize and type the code
            </p>
          </div>

          {/* Header */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full max-w-md">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/games">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
            </Button>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-sm">
                <Brain className="h-4 w-4 text-cyan-500" />
                <span className="text-muted-foreground">Level</span>
                <span className="font-bold text-foreground">{level}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Hash className="h-4 w-4 text-blue-500" />
                <span className="text-muted-foreground">Chars</span>
                <span className="font-bold text-foreground">{code.length || codeLength}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Trophy className="h-4 w-4 text-violet-500" />
                <span className="font-bold text-foreground">{score}</span>
              </div>
            </div>
          </div>

          {/* Game Area */}
          {!isIdle && (
            <>
              <CodeDisplay code={code} gameState={gameState} />
              <CodeInput
                value={userInput}
                codeLength={code.length}
                gameState={gameState}
                onChange={handleInputChange}
                onSubmit={handleSubmit}
              />
            </>
          )}

          {/* Start Button */}
          {isIdle && (
            <Button
              size="lg"
              onClick={startGame}
              className="h-14 px-10 text-lg font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-lg shadow-cyan-500/25"
            >
              Start Game
            </Button>
          )}

          {gameState === "success" && (
            <p className="text-lg font-medium text-emerald-500 animate-pulse">
              Correct! Next level...
            </p>
          )}
        </div>
      </main>

      {/* Game Over Dialog */}
      <GameOverDialog
        open={gameState === "gameover"}
        level={level}
        codeLength={code.length}
        score={score}
        correctCode={code}
        onPlayAgain={startGame}
      />
    </div>
  );
}
