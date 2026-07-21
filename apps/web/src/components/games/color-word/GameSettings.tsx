"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GameMode, RuleMode, Difficulty, GameState } from "@/lib/games/color-word/types";
import { Zap, Target, Flame, CheckSquare, Palette, FileText, Shuffle, ShieldAlert } from "lucide-react";

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
  { mode: "blitz", label: "Blitz 30s", icon: Zap, colorClass: "from-rose-500 to-purple-600" },
  { mode: "rounds", label: "20 Rund", icon: Target, colorClass: "from-purple-600 to-indigo-600" },
  { mode: "fever", label: "Fever Combo", icon: Flame, colorClass: "from-amber-500 to-red-600" },
  { mode: "true_false", label: "Prawda/Fałsz", icon: CheckSquare, colorClass: "from-cyan-500 to-blue-600" },
];

const RULE_MODE_OPTIONS: { rule: RuleMode; label: string; icon: any }[] = [
  { rule: "color", label: "Kolor Czcionki 🎨", icon: Palette },
  { rule: "text", label: "Treść Słowa 📝", icon: FileText },
  { rule: "mixed", label: "Zmienna Reguła 🔀", icon: Shuffle },
];

const DIFFICULTY_OPTIONS: { diff: Difficulty; label: string }[] = [
  { diff: "easy", label: "Łatwy (4 kolory)" },
  { diff: "medium", label: "Średni (7 kolorów)" },
  { diff: "expert", label: "Ekspert (Tło Zwodnicze 🎭)" },
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
    <div className="flex flex-col gap-4 w-full max-w-2xl bg-card/40 backdrop-blur border border-border/50 rounded-2xl p-4 md:p-5 shadow-md">
      {/* Game Mode Selection */}
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-rose-400" /> Tryb Rozgrywki
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {GAME_MODE_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isSelected = gameMode === opt.mode;
            return (
              <Button
                key={opt.mode}
                type="button"
                variant={isSelected ? "default" : "outline"}
                size="sm"
                disabled={isPlaying}
                onClick={() => onGameModeChange(opt.mode)}
                className={
                  isSelected
                    ? `bg-gradient-to-r ${opt.colorClass} text-white font-extrabold shadow-md shadow-rose-500/20`
                    : "hover:border-rose-500/40"
                }
              >
                <Icon className="w-3.5 h-3.5 mr-1.5" />
                {opt.label}
              </Button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Rule Mode Selection */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Shuffle className="w-3.5 h-3.5 text-purple-400" /> Reguła Pytania
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {RULE_MODE_OPTIONS.map((opt) => {
              const isSelected = ruleMode === opt.rule;
              return (
                <Button
                  key={opt.rule}
                  type="button"
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  disabled={isPlaying}
                  onClick={() => onRuleModeChange(opt.rule)}
                  className={
                    isSelected
                      ? "bg-purple-600 text-white font-bold shadow-md shadow-purple-500/20"
                      : "hover:border-purple-500/40 text-xs"
                  }
                >
                  {opt.label}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Difficulty Selection */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" /> Trudność
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {DIFFICULTY_OPTIONS.map((opt) => {
              const isSelected = difficulty === opt.diff;
              return (
                <Button
                  key={opt.diff}
                  type="button"
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  disabled={isPlaying}
                  onClick={() => onDifficultyChange(opt.diff)}
                  className={
                    isSelected
                      ? "bg-amber-500 text-black font-extrabold shadow-md shadow-amber-500/20"
                      : "hover:border-amber-500/40 text-xs"
                  }
                >
                  {opt.label}
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
