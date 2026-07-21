"use client";

import { GameMode, RuleMode, Difficulty, GameState } from "@/lib/games/color-word/types";
import { Zap, Target, Flame, CheckSquare, Palette, FileText, Shuffle, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

interface GameSettingsProps {
  gameMode: GameMode;
  ruleMode: RuleMode;
  difficulty: Difficulty;
  gameState: GameState;
  onGameModeChange: (mode: GameMode) => void;
  onRuleModeChange: (rule: RuleMode) => void;
  onDifficultyChange: (diff: Difficulty) => void;
}

const GAME_MODE_OPTIONS: { mode: GameMode; label: string; icon: any; colorClass: string }[] = [
  { mode: "blitz", label: "Blitz 30s", icon: Zap, colorClass: "bg-portal-pink text-white" },
  { mode: "rounds", label: "20 Rounds", icon: Target, colorClass: "bg-portal-violet text-white" },
  { mode: "fever", label: "Fever Combo", icon: Flame, colorClass: "bg-portal-yellow text-[#07150f]" },
  { mode: "true_false", label: "True / False", icon: CheckSquare, colorClass: "bg-portal-blue text-[#07150f]" },
];

const RULE_MODE_OPTIONS: { rule: RuleMode; label: string; icon: any }[] = [
  { rule: "color", label: "Font Color 🎨", icon: Palette },
  { rule: "text", label: "Word Text 📝", icon: FileText },
  { rule: "mixed", label: "Dynamic Rule 🔀", icon: Shuffle },
];

const DIFFICULTY_OPTIONS: { diff: Difficulty; label: string }[] = [
  { diff: "easy", label: "Easy (4 Colors)" },
  { diff: "medium", label: "Medium (7 Colors)" },
  { diff: "expert", label: "Expert (Distracting BG 🎭)" },
];

export function GameSettings({
  gameMode,
  ruleMode,
  difficulty,
  gameState,
  onGameModeChange,
  onRuleModeChange,
  onDifficultyChange,
}: GameSettingsProps) {
  const isPlaying = gameState === "playing" || gameState === "countdown";

  return (
    <div className="flex flex-col gap-4 w-full bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-5 shadow-2xl">
      {/* Game Mode Selection */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Zap className="size-3.5 text-portal-pink" /> Game Mode
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {GAME_MODE_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isSelected = gameMode === opt.mode;
            return (
              <button
                key={opt.mode}
                type="button"
                disabled={isPlaying}
                onClick={() => onGameModeChange(opt.mode)}
                className={cn(
                  "inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-extrabold transition-all duration-200",
                  isSelected
                    ? `${opt.colorClass} shadow-lg`
                    : "border border-white/10 bg-white/5 text-muted-foreground hover:border-portal-pink/40 hover:text-foreground",
                )}
              >
                <Icon className="size-3.5" />
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Rule Mode Selection */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Shuffle className="size-3.5 text-portal-violet" /> Question Rule
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {RULE_MODE_OPTIONS.map((opt) => {
              const isSelected = ruleMode === opt.rule;
              return (
                <button
                  key={opt.rule}
                  type="button"
                  disabled={isPlaying}
                  onClick={() => onRuleModeChange(opt.rule)}
                  className={cn(
                    "rounded-xl px-3 py-1.5 text-xs font-bold transition-all duration-200",
                    isSelected
                      ? "bg-portal-violet text-white shadow-[0_0_15px_rgba(117,92,255,0.3)]"
                      : "border border-white/10 bg-white/5 text-muted-foreground hover:border-portal-violet/40 hover:text-foreground",
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Difficulty Selection */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <ShieldAlert className="size-3.5 text-portal-yellow" /> Difficulty Mode
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {DIFFICULTY_OPTIONS.map((opt) => {
              const isSelected = difficulty === opt.diff;
              return (
                <button
                  key={opt.diff}
                  type="button"
                  disabled={isPlaying}
                  onClick={() => onDifficultyChange(opt.diff)}
                  className={cn(
                    "rounded-xl px-3 py-1.5 text-xs font-bold transition-all duration-200",
                    isSelected
                      ? "bg-portal-yellow text-[#07150f] font-extrabold shadow-[0_0_15px_rgba(255,213,74,0.3)]"
                      : "border border-white/10 bg-white/5 text-muted-foreground hover:border-portal-yellow/40 hover:text-foreground",
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

