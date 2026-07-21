"use client";

import { useEffect } from "react";
import { Question, GameState, ColorItem } from "@/lib/games/color-word/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Sparkles, AlertCircle, Check, X, Flame } from "lucide-react";
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
          onAnswer(true);
        } else if (key === "2" || key === "n" || key === "f" || key === "arrowright") {
          onAnswer(false);
        }
      } else {
        const keyIndex = parseInt(key, 10) - 1;
        if (!isNaN(keyIndex) && keyIndex >= 0 && keyIndex < question.options.length) {
          onAnswer(question.options[keyIndex].id);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying, question, onAnswer]);

  return (
    <div className="relative w-full max-w-xl flex flex-col items-center gap-6">
      {/* Main Question Display Card */}
      <div
        className={cn(
          "relative w-full h-60 md:h-68 rounded-3xl bg-card/60 backdrop-blur-xl border border-border/80 shadow-2xl flex flex-col items-center justify-center p-6 text-center transition-all duration-200 overflow-hidden select-none",
          feverActive && "ring-4 ring-amber-500/50 shadow-amber-500/30 scale-[1.01]",
          feedback === "correct" && "border-2 border-emerald-500 bg-emerald-500/10 shadow-emerald-500/20 scale-[1.02]",
          feedback === "wrong" && "border-2 border-rose-500 bg-rose-500/10 shadow-rose-500/20 animate-shake"
        )}
        style={
          question?.bgDistraction
            ? { backgroundColor: `${question.bgDistraction.hex}15` }
            : undefined
        }
      >
        {/* Dynamic Rule Prompt Badge */}
        {question && (
          <Badge
            variant="outline"
            className={cn(
              "mb-4 font-extrabold uppercase tracking-wider px-3.5 py-1 text-xs md:text-sm flex items-center gap-1.5 shadow-sm transition-colors",
              question.target === "color"
                ? "bg-rose-500/15 border-rose-500/40 text-rose-300"
                : "bg-cyan-500/15 border-cyan-500/40 text-cyan-300"
            )}
          >
            <AlertCircle className="w-4 h-4" />
            {question.target === "color"
              ? "🎨 Zaznacz KOLOR CZCIONKI (nie treść!)"
              : "📝 Zaznacz TREŚĆ NAPISU (nie kolor!)"}
          </Badge>
        )}

        {/* Fever Indicator Banner */}
        {feverActive && (
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500 text-black text-xs font-black uppercase tracking-wider animate-pulse shadow-lg">
            <Flame className="w-3.5 h-3.5 fill-current" /> FEVER x2
          </div>
        )}

        {/* True/False Statement or Word Display */}
        {question ? (
          <div className="flex flex-col items-center">
            <h2
              className={cn(
                "text-5xl md:text-7xl font-black tracking-wider transition-all duration-150 transform active:scale-95 drop-shadow-md",
                question.colorInk.textColorClass
              )}
              style={{ color: question.colorInk.hex }}
            >
              {question.textWord.namePl}
            </h2>

            {question.isTrueFalse && question.tfTargetColor && (
              <p className="mt-4 text-base md:text-lg font-semibold text-foreground bg-background/60 backdrop-blur px-4 py-1.5 rounded-xl border border-border/60">
                Czy {question.target === "color" ? "czcionka ma kolor" : "treść napisu to"}{" "}
                <span
                  className="font-extrabold uppercase tracking-wide underline underline-offset-4"
                  style={{ color: question.tfTargetColor.hex }}
                >
                  {question.tfTargetColor.namePl}
                </span>
                ?
              </p>
            )}
          </div>
        ) : (
          <span className="text-muted-foreground text-xl">...</span>
        )}

        {/* Countdown Overlay */}
        {gameState === "countdown" && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/90 backdrop-blur-md animate-in fade-in duration-200">
            <span className="text-7xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-purple-500 to-indigo-500 animate-pulse">
              {countdown}
            </span>
            <p className="text-sm font-bold text-muted-foreground mt-4 tracking-widest uppercase">
              Bądź czujny i skup wzrok...
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
              Ignoruj treść lub czcionkę zależnie od reguły! Trenuj hamowanie reakcji (Efekt Stroopa) oraz refleks.
            </p>
            <Button
              size="lg"
              onClick={onStartGame}
              className="bg-gradient-to-r from-rose-500 via-purple-600 to-indigo-600 hover:from-rose-600 hover:to-indigo-700 text-white font-extrabold px-8 shadow-lg shadow-rose-500/25 transition-transform hover:scale-105"
            >
              <Play className="w-5 h-5 mr-2 fill-current" />
              Rozpocznij Grę
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
            TAK (Prawda) <span className="text-xs font-mono opacity-80 ml-2">[1]</span>
          </Button>

          <Button
            size="lg"
            disabled={!isPlaying}
            onClick={() => onAnswer(false)}
            className="h-16 text-xl font-extrabold bg-rose-600 hover:bg-rose-700 text-white rounded-2xl shadow-lg shadow-rose-500/20 active:scale-95 transition-transform"
          >
            <X className="w-6 h-6 mr-2 stroke-[3]" />
            NIE (Fałsz) <span className="text-xs font-mono opacity-80 ml-2">[2]</span>
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
                "relative group flex items-center justify-between p-4 rounded-2xl bg-card/60 backdrop-blur border border-border/60 shadow-md transition-all duration-150 select-none touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 active:scale-95",
                isPlaying
                  ? "hover:border-rose-500/50 hover:bg-rose-500/10 hover:shadow-lg hover:-translate-y-0.5"
                  : "opacity-60 cursor-not-allowed"
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-6 h-6 rounded-full border border-white/20 shadow-md transition-transform group-hover:scale-110"
                  style={{ backgroundColor: option.hex }}
                />
                <span className="text-base md:text-lg font-extrabold tracking-wide text-foreground">
                  {option.namePl}
                </span>
              </div>

              <Badge
                variant="outline"
                className="text-[10px] font-mono border-border/80 bg-background/50 text-muted-foreground px-1.5 py-0.5"
              >
                [{index + 1}]
              </Badge>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
