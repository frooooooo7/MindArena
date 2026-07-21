"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ColorWordStats, GameMode } from "@/lib/games/color-word/types";
import { Trophy, Flame, Target, RotateCcw, Sparkles, Zap, CheckCircle, XCircle } from "lucide-react";

interface GameOverDialogProps {
  open: boolean;
  stats: ColorWordStats | null;
  gameMode: GameMode;
  onPlayAgain: () => void;
  onClose: () => void;
}

export function GameOverDialog({
  open,
  stats,
  gameMode,
  onPlayAgain,
  onClose,
}: GameOverDialogProps) {
  if (!stats) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border-rose-500/20">
        <DialogHeader className="text-center flex flex-col items-center">
          {stats.isNewRecord ? (
            <div className="p-3 rounded-full bg-gradient-to-br from-rose-500 to-purple-600 text-white mb-2 animate-bounce shadow-lg shadow-rose-500/30">
              <Trophy className="w-8 h-8" />
            </div>
          ) : (
            <div className="p-3 rounded-full bg-rose-500/10 text-rose-400 mb-2 border border-rose-500/20">
              <Sparkles className="w-8 h-8" />
            </div>
          )}

          <DialogTitle className="text-2xl font-extrabold tracking-tight">
            {stats.isNewRecord ? "New High Score!" : "Game Over!"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            Color Word Challenge (
            {gameMode === "blitz"
              ? "Blitz 30s Mode"
              : gameMode === "fever"
              ? "Fever Combo Mode 🔥"
              : gameMode === "true_false"
              ? "True / False Mode ⚡"
              : "20 Rounds"})
          </DialogDescription>
        </DialogHeader>

        {/* Main Score Display */}
        <div className="flex flex-col items-center justify-center p-4 my-2 rounded-2xl bg-gradient-to-r from-rose-500/10 via-purple-500/10 to-indigo-500/10 border border-rose-500/20">
          <span className="text-xs font-semibold uppercase tracking-wider text-rose-400">
            Final Score
          </span>
          <span className="text-4xl font-extrabold text-rose-300 mt-1">
            {stats.score}
          </span>
        </div>

        {/* Detailed Stats Grid */}
        <div className="grid grid-cols-2 gap-3 my-2">
          {/* Reaction Time */}
          <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
            <div className="flex items-center gap-1 text-xs font-semibold text-cyan-400 uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5" /> Avg Reaction
            </div>
            <span className="text-2xl font-mono font-bold text-cyan-300 mt-1">
              {stats.avgReactionTimeMs} <span className="text-xs font-normal">ms</span>
            </span>
          </div>

          {/* Accuracy */}
          <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="flex items-center gap-1 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              <Target className="w-3.5 h-3.5" /> Accuracy
            </div>
            <span className="text-2xl font-mono font-bold text-emerald-300 mt-1">
              {stats.accuracy}%
            </span>
          </div>

          {/* Max Streak */}
          <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-center gap-1 text-xs font-semibold text-amber-400 uppercase tracking-wider">
              <Flame className="w-3.5 h-3.5" /> Max Streak
            </div>
            <span className="text-2xl font-mono font-bold text-amber-300 mt-1">
              {stats.maxStreak}
            </span>
          </div>

          {/* Correct / Wrong ratio */}
          <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
            <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">
              Correct / Wrong
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-lg font-bold text-emerald-400 flex items-center gap-0.5">
                <CheckCircle className="w-4 h-4" /> {stats.correctAnswers}
              </span>
              <span className="text-muted-foreground font-light">/</span>
              <span className="text-lg font-bold text-rose-400 flex items-center gap-0.5">
                <XCircle className="w-4 h-4" /> {stats.wrongAnswers}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="sm:justify-center mt-2">
          <Button
            size="lg"
            onClick={onPlayAgain}
            className="w-full bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white font-extrabold shadow-lg shadow-rose-500/20"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Play Again
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
