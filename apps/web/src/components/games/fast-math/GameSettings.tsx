"use client";

import { useState } from "react";
import { MathOperation, Difficulty, GameMode, GameState } from "@/lib/games/fast-math/types";
import { Calculator, Zap, ShieldAlert, SlidersHorizontal, Flame, Target, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface GameSettingsProps {
  operation: MathOperation;
  difficulty: Difficulty;
  gameMode: GameMode;
  timePreset: number;
  equationPreset: number;
  gameState: GameState;
  onOperationChange: (op: MathOperation) => void;
  onDifficultyChange: (diff: Difficulty) => void;
  onGameModeChange: (mode: GameMode) => void;
  onTimePresetChange: (seconds: number) => void;
  onEquationPresetChange: (count: number) => void;
}

const OPERATIONS: { op: MathOperation; label: string; symbol: string }[] = [
  { op: "add", label: "Addition", symbol: "+" },
  { op: "subtract", label: "Subtraction", symbol: "-" },
  { op: "multiply", label: "Multiplication", symbol: "×" },
  { op: "divide", label: "Division", symbol: "÷" },
  { op: "mixed", label: "Mixed Operations", symbol: "🔀" },
];

const DIFFICULTIES: { diff: Difficulty; label: string; range: string }[] = [
  { diff: "easy", label: "Easy", range: "1 – 10" },
  { diff: "medium", label: "Medium", range: "1 – 100" },
  { diff: "hard", label: "Hard", range: "10 – 1,000" },
];

const GAME_MODES: { mode: GameMode; label: string; icon: any }[] = [
  { mode: "blitz", label: "Blitz (Timer)", icon: Zap },
  { mode: "equations", label: "Equations Count", icon: Target },
  { mode: "survival", label: "Survival (3 Lives)", icon: Heart },
];

const TIME_PRESETS = [30, 60, 120, 200];
const EQUATION_PRESETS = [10, 20, 50, 100];

export function GameSettings({
  operation,
  difficulty,
  gameMode,
  timePreset,
  equationPreset,
  gameState,
  onOperationChange,
  onDifficultyChange,
  onGameModeChange,
  onTimePresetChange,
  onEquationPresetChange,
}: GameSettingsProps) {
  const isPlaying = gameState === "playing" || gameState === "countdown";

  const [customTimeInput, setCustomTimeInput] = useState<string>("");
  const [customEquationInput, setCustomEquationInput] = useState<string>("");

  const handleCustomTimeSubmit = () => {
    const val = parseInt(customTimeInput, 10);
    if (!isNaN(val) && val >= 5 && val <= 600) {
      onTimePresetChange(val);
    }
  };

  const handleCustomEquationSubmit = () => {
    const val = parseInt(customEquationInput, 10);
    if (!isNaN(val) && val >= 5 && val <= 300) {
      onEquationPresetChange(val);
    }
  };

  return (
    <div className="flex flex-col gap-5 w-full bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-5 shadow-2xl">
      {/* 1. Operation Selection */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Calculator className="size-3.5 text-portal-mint" /> Math Operation
        </span>
        <div className="flex items-center gap-1.5 flex-wrap">
          {OPERATIONS.map((item) => {
            const isSelected = operation === item.op;
            return (
              <button
                key={item.op}
                type="button"
                disabled={isPlaying}
                onClick={() => onOperationChange(item.op)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all duration-200",
                  isSelected
                    ? "bg-portal-mint text-[#07150f] font-extrabold shadow-[0_0_15px_rgba(112,245,193,0.3)]"
                    : "border border-white/10 bg-white/5 text-muted-foreground hover:border-portal-mint/40 hover:text-foreground",
                )}
              >
                <span className="font-mono text-sm">{item.symbol}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* 2. Difficulty Selection */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <ShieldAlert className="size-3.5 text-portal-yellow" /> Number Range (Difficulty)
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {DIFFICULTIES.map((item) => {
              const isSelected = difficulty === item.diff;
              return (
                <button
                  key={item.diff}
                  type="button"
                  disabled={isPlaying}
                  onClick={() => onDifficultyChange(item.diff)}
                  className={cn(
                    "rounded-xl px-3 py-1.5 text-xs font-bold transition-all duration-200",
                    isSelected
                      ? "bg-portal-yellow text-[#07150f] font-extrabold shadow-[0_0_15px_rgba(255,213,74,0.3)]"
                      : "border border-white/10 bg-white/5 text-muted-foreground hover:border-portal-yellow/40 hover:text-foreground",
                  )}
                >
                  {item.label} <span className="opacity-75 font-normal">({item.range})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Game Mode Selection */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="size-3.5 text-portal-blue" /> Game Mode
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {GAME_MODES.map((item) => {
              const Icon = item.icon;
              const isSelected = gameMode === item.mode;
              return (
                <button
                  key={item.mode}
                  type="button"
                  disabled={isPlaying}
                  onClick={() => onGameModeChange(item.mode)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all duration-200",
                    isSelected
                      ? "bg-portal-blue text-[#07150f] font-extrabold shadow-[0_0_15px_rgba(75,168,255,0.3)]"
                      : "border border-white/10 bg-white/5 text-muted-foreground hover:border-portal-blue/40 hover:text-foreground",
                  )}
                >
                  <Icon className="size-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Blitz Custom Time Limits */}
      {gameMode === "blitz" && (
        <div className="flex flex-col gap-2 border-t border-white/10 pt-4">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Time Duration (Seconds)
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            {TIME_PRESETS.map((sec) => (
              <button
                key={sec}
                type="button"
                disabled={isPlaying}
                onClick={() => onTimePresetChange(sec)}
                className={cn(
                  "rounded-xl px-3 py-1.5 text-xs font-bold transition-all duration-200",
                  timePreset === sec
                    ? "bg-portal-violet text-white font-extrabold shadow-[0_0_15px_rgba(117,92,255,0.3)]"
                    : "border border-white/10 bg-white/5 text-muted-foreground hover:border-portal-violet/40 hover:text-foreground",
                )}
              >
                {sec}s
              </button>
            ))}

            {/* Custom Input */}
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                disabled={isPlaying}
                placeholder="Custom..."
                value={customTimeInput}
                onChange={(e) => setCustomTimeInput(e.target.value)}
                onBlur={handleCustomTimeSubmit}
                onKeyDown={(e) => e.key === "Enter" && handleCustomTimeSubmit()}
                className="w-24 rounded-xl border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-foreground placeholder:text-muted-foreground focus:border-portal-violet focus:outline-none"
              />
              {timePreset !== 30 && timePreset !== 60 && timePreset !== 120 && timePreset !== 200 && (
                <span className="rounded-lg bg-portal-violet/20 px-2 py-0.5 text-xs font-bold text-portal-violet">
                  Active: {timePreset}s
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. Equations Count Custom Settings */}
      {gameMode === "equations" && (
        <div className="flex flex-col gap-2 border-t border-white/10 pt-4">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Target Equations Count
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            {EQUATION_PRESETS.map((count) => (
              <button
                key={count}
                type="button"
                disabled={isPlaying}
                onClick={() => onEquationPresetChange(count)}
                className={cn(
                  "rounded-xl px-3 py-1.5 text-xs font-bold transition-all duration-200",
                  equationPreset === count
                    ? "bg-portal-violet text-white font-extrabold shadow-[0_0_15px_rgba(117,92,255,0.3)]"
                    : "border border-white/10 bg-white/5 text-muted-foreground hover:border-portal-violet/40 hover:text-foreground",
                )}
              >
                {count} Eq
              </button>
            ))}

            {/* Custom Input */}
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                disabled={isPlaying}
                placeholder="Custom..."
                value={customEquationInput}
                onChange={(e) => setCustomEquationInput(e.target.value)}
                onBlur={handleCustomEquationSubmit}
                onKeyDown={(e) => e.key === "Enter" && handleCustomEquationSubmit()}
                className="w-24 rounded-xl border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-foreground placeholder:text-muted-foreground focus:border-portal-violet focus:outline-none"
              />
              {equationPreset !== 10 && equationPreset !== 20 && equationPreset !== 50 && equationPreset !== 100 && (
                <span className="rounded-lg bg-portal-violet/20 px-2 py-0.5 text-xs font-bold text-portal-violet">
                  Active: {equationPreset} Eq
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
