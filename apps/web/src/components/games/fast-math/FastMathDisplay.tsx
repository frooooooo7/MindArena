"use client";

import { useEffect, useRef, useState } from "react";
import { Question, GameState } from "@/lib/games/fast-math/types";
import { Button } from "@/components/ui/button";
import { Play, Calculator, ArrowRight, CornerDownLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface FastMathDisplayProps {
  question: Question | null;
  gameState: GameState;
  countdown: number;
  feedback: "correct" | "wrong" | null;
  onAnswer: (option: number) => void;
  onStartGame: () => void;
}

export function FastMathDisplay({
  question,
  gameState,
  countdown,
  feedback,
  onAnswer,
  onStartGame,
}: FastMathDisplayProps) {
  const isPlaying = gameState === "playing";
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input field when game is playing or question changes
  useEffect(() => {
    if (isPlaying) {
      setInputValue("");
      inputRef.current?.focus();
    }
  }, [isPlaying, question]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isPlaying || !question || inputValue.trim() === "") return;

    const numericVal = parseInt(inputValue.trim(), 10);
    if (!isNaN(numericVal)) {
      onAnswer(numericVal);
      setInputValue("");
      inputRef.current?.focus();
    }
  };

  return (
    <div className="relative w-full max-w-xl flex flex-col items-center gap-6">
      {/* Main Question Display Card */}
      <div
        className={cn(
          "relative w-full h-64 md:h-72 rounded-3xl bg-white/[0.03] backdrop-blur-2xl border border-white/10 shadow-2xl flex flex-col items-center justify-center p-6 select-none transition-all duration-200 overflow-hidden",
          feedback === "correct" && "border-2 border-emerald-500 bg-emerald-500/15 shadow-emerald-500/20 scale-[1.02]",
          feedback === "wrong" && "border-2 border-rose-500 bg-rose-500/15 shadow-rose-500/20 animate-shake"
        )}
      >
        {/* Central Equation Display */}
        {question ? (
          <div className="flex flex-col items-center justify-center text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-portal-mint mb-2">
              Type Answer & Press Enter
            </span>
            <h2 className="font-display text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-wider text-foreground">
              {question.equation} <span className="text-portal-mint">?</span>
            </h2>
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <span className="text-muted-foreground text-xl">...</span>
          </div>
        )}

        {/* Countdown Overlay */}
        {gameState === "countdown" && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/90 backdrop-blur-md animate-in fade-in duration-200">
            <span className="font-display text-7xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 animate-pulse">
              {countdown}
            </span>
            <p className="text-sm font-bold text-muted-foreground mt-4 tracking-widest uppercase">
              Get Ready to Type...
            </p>
          </div>
        )}

        {/* Idle Overlay */}
        {gameState === "idle" && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/85 backdrop-blur-md p-6 text-center animate-in fade-in duration-300">
            <div className="p-4 rounded-2xl bg-portal-mint/10 border border-portal-mint/20 mb-4 shadow-xl text-portal-mint">
              <Calculator className="size-12" />
            </div>
            <h3 className="font-display text-2xl font-extrabold tracking-tight mb-2">Fast Math Challenge</h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-6">
              Type the answer to each equation and press Enter ↵ to submit instantly!
            </p>
            <Button
              size="lg"
              onClick={onStartGame}
              className="bg-portal-mint text-[#07150f] font-extrabold px-8 hover:bg-portal-mint/90 hover:shadow-[0_0_20px_rgba(112,245,193,0.35)] transition-transform hover:scale-105"
            >
              <Play className="size-5 mr-2 fill-current" />
              Start Game
            </Button>
          </div>
        )}
      </div>

      {/* Numeric Answer Input Form - Rendered ONLY during gameplay */}
      {isPlaying && (
        <form onSubmit={handleSubmit} className="w-full flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              autoFocus
              placeholder="Type answer & press Enter..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full h-14 rounded-2xl border border-white/10 bg-white/[0.04] px-5 font-display text-2xl font-extrabold text-foreground placeholder:text-muted-foreground/50 transition-all focus:border-portal-mint focus:bg-white/[0.08] focus:outline-none focus:ring-4 focus:ring-portal-mint/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1 text-xs font-bold text-muted-foreground bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg">
              <span>Enter</span>
              <CornerDownLeft className="size-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={inputValue.trim() === ""}
            className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-portal-mint px-6 font-extrabold text-[#07150f] transition-all hover:bg-portal-mint/90 hover:shadow-[0_0_20px_rgba(112,245,193,0.35)] disabled:opacity-40"
          >
            <span>Submit</span>
            <ArrowRight className="size-5" />
          </button>
        </form>
      )}
    </div>
  );
}
