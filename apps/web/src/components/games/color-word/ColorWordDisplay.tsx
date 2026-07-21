"use client";

import { useEffect } from "react";
import { Question, GameState } from "@/lib/games/color-word/types";
import { Button } from "@/components/ui/button";
import { Play, Sparkles, Check, X, Flame, Palette, Type, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ColorWordDisplayProps {
  question: Question | null;
  gameState: GameState;
  countdown: number;
  feverActive: boolean;
  feedback: "correct" | "wrong" | null;
  onAnswer: (colorIdOrBool: any) => void;
  onStartGame: () => void;
}

export function ColorWordDisplay({
  question,
  gameState,
  countdown,
  feverActive,
  feedback,
  onAnswer,
  onStartGame,
}: ColorWordDisplayProps) {
  const isPlaying = gameState === "playing";

  // Keyboard shortcut listener
  useEffect(() => {
    if (!isPlaying || !question) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      if (question.isTrueFalse) {
        if (key === "1" || key === "t" || key === "y" || key === "arrowleft") {
          e.preventDefault();
          onAnswer(true);
        } else if (key === "2" || key === "n" || key === "f" || key === "arrowright") {
          e.preventDefault();
          onAnswer(false);
        }
      } else {
        const keyIndex = parseInt(key, 10) - 1;
        if (!isNaN(keyIndex) && keyIndex >= 0 && keyIndex < question.options.length) {
          e.preventDefault();
          onAnswer(question.options[keyIndex].id);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying, question, onAnswer]);

  const isColorTarget = question?.target === "color" && !question.isTrueFalse;
  const isTextTarget = question?.target === "text" && !question.isTrueFalse;

  return (
    <div className="relative w-full max-w-xl flex flex-col items-center gap-6">
      {/* Main Question Display Card */}
      <div
        className={cn(
          "relative w-full h-72 md:h-80 rounded-3xl backdrop-blur-xl border-2 shadow-2xl flex flex-col items-center justify-between p-0 overflow-hidden select-none transition-all duration-200",
          isColorTarget && "bg-purple-950/20 border-purple-500/60 shadow-purple-500/20",
          isTextTarget && "bg-cyan-950/20 border-cyan-500/60 shadow-cyan-500/20",
          question?.isTrueFalse && "bg-amber-950/20 border-amber-500/60 shadow-amber-500/20",
          feverActive && "ring-4 ring-amber-500/70 shadow-amber-500/40 scale-[1.01]",
          feedback === "correct" && "border-4 border-emerald-500 bg-emerald-500/20 shadow-emerald-500/30 scale-[1.02]",
          feedback === "wrong" && "border-4 border-rose-500 bg-rose-500/20 shadow-rose-500/30 animate-shake"
        )}
        style={
          question?.bgDistraction
            ? { backgroundColor: `${question.bgDistraction.hex}20` }
            : undefined
        }
      >
        {/* Clean Single Icon Rule Header Bar */}
        {question && (
          <div
            className={cn(
              "w-full py-3 px-4 flex items-center justify-center gap-2.5 font-black uppercase tracking-wider text-lg md:text-xl shadow-md transition-all duration-150 animate-in fade-in slide-in-from-top-2",
              question.isTrueFalse
                ? "bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-black"
                : isColorTarget
                ? "bg-gradient-to-r from-purple-600 via-rose-600 to-pink-600 text-white"
                : "bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 text-white"
            )}
          >
            {question.isTrueFalse ? (
              <>
                <HelpCircle className="w-6 h-6 stroke-[3]" />
                <span>TRUE OR FALSE?</span>
              </>
            ) : isColorTarget ? (
              <>
                <Palette className="w-6 h-6 stroke-[2.5]" />
                <span>FONT COLOR</span>
              </>
            ) : (
              <>
                <Type className="w-6 h-6 stroke-[2.5]" />
                <span>WORD TEXT</span>
              </>
            )}
          </div>
        )}

        {/* Fever Indicator Banner */}
        {feverActive && (
          <div className="absolute top-14 right-3 flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500 text-black text-xs font-black uppercase tracking-wider animate-pulse shadow-lg z-10">
            <Flame className="w-4 h-4 fill-current" /> FEVER x2
          </div>
        )}

        {/* Central Word Display */}
        {question ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center py-4">
            <h2
              className={cn(
                "text-3xl sm:text-5xl md:text-6xl font-black tracking-wider transition-all duration-150 transform active:scale-95 drop-shadow-lg max-w-full px-2 leading-none",
                question.colorInk.textColorClass
              )}
              style={{ color: question.colorInk.hex }}
            >
              {question.textWord.nameEn || question.textWord.namePl}
            </h2>

            {/* Sub-label Hint */}
            <p className="mt-3 text-sm md:text-base font-bold text-muted-foreground bg-background/50 backdrop-blur px-4 py-1 rounded-full border border-border/40">
              {question.isTrueFalse
                ? "Select YES if font ink and word text match"
                : isColorTarget
                ? "Select the font ink color you see"
                : "Select what the written text says"}
            </p>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <span className="text-muted-foreground text-xl">...</span>
          </div>
        )}

        {/* Countdown Overlay */}
        {gameState === "countdown" && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/90 backdrop-blur-md animate-in fade-in duration-200">
            <span className="text-7xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-purple-500 to-indigo-500 animate-pulse">
              {countdown}
            </span>
            <p className="text-sm font-bold text-muted-foreground mt-4 tracking-widest uppercase">
              Watch the rule header at the top!
            </p>
          </div>
        )}

        {/* Idle Overlay */}
        {gameState === "idle" && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/85 backdrop-blur-md p-6 text-center animate-in fade-in duration-300">
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 mb-4 shadow-xl">
              <Sparkles className="w-12 h-12 text-rose-400" />
            </div>
            <h3 className="text-2xl font-extrabold tracking-tight mb-2">Color Word Challenge</h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-6">
              Watch top header rule: FONT COLOR or WORD TEXT!
            </p>
            <Button
              size="lg"
              onClick={onStartGame}
              className="bg-gradient-to-r from-rose-500 via-purple-600 to-indigo-600 hover:from-rose-600 hover:to-indigo-700 text-white font-extrabold px-8 shadow-lg shadow-rose-500/25 transition-transform hover:scale-105"
            >
              <Play className="w-5 h-5 mr-2 fill-current" />
              Start Game
            </Button>
          </div>
        )}
      </div>

      {/* Answer Options Grid */}
      {question?.isTrueFalse ? (
        /* True / False Buttons */
        <div className="grid grid-cols-2 gap-4 w-full">
          <Button
            size="lg"
            disabled={!isPlaying}
            onClick={() => onAnswer(true)}
            className="h-16 text-xl font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-transform"
          >
            <Check className="w-6 h-6 mr-2 stroke-[3]" />
            YES (True) <span className="text-xs font-mono opacity-80 ml-2">[1]</span>
          </Button>

          <Button
            size="lg"
            disabled={!isPlaying}
            onClick={() => onAnswer(false)}
            className="h-16 text-xl font-extrabold bg-rose-600 hover:bg-rose-700 text-white rounded-2xl shadow-lg shadow-rose-500/20 active:scale-95 transition-transform"
          >
            <X className="w-6 h-6 mr-2 stroke-[3]" />
            NO (False) <span className="text-xs font-mono opacity-80 ml-2">[2]</span>
          </Button>
        </div>
      ) : (
        /* Standard 4 Choices Grid */
        <div className="grid grid-cols-2 gap-3 w-full">
          {question?.options.map((option, index) => (
            <button
              key={option.id}
              type="button"
              disabled={!isPlaying}
              onClick={() => onAnswer(option.id)}
              className={cn(
                "relative group flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-md transition-all duration-150 select-none touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-portal-pink active:scale-95",
                isPlaying
                  ? "hover:border-portal-pink/50 hover:bg-portal-pink/10 hover:shadow-lg hover:-translate-y-0.5"
                  : "opacity-60 cursor-not-allowed"
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-6 h-6 rounded-full border border-white/20 shadow-md transition-transform group-hover:scale-110"
                  style={{ backgroundColor: option.hex }}
                />
                <span className="text-base md:text-lg font-extrabold tracking-wide text-foreground">
                  {option.nameEn || option.namePl}
                </span>
              </div>

              <div className="text-[10px] font-mono border border-border/80 bg-background/50 text-muted-foreground px-1.5 py-0.5 rounded">
                [{index + 1}]
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
