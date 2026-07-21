"use client";

import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FastMathStats } from "@/lib/games/fast-math/types";
import { Trophy, Flame, Target, RotateCcw, Sparkles, Zap, CheckCircle, XCircle, Swords } from "lucide-react";

interface GameOverDialogProps {
  open: boolean;
  stats: FastMathStats | null;
  onPlayAgain: () => void;
  onClose: () => void;
}

export function GameOverDialog({
  open,
  stats,
  onPlayAgain,
  onClose,
}: GameOverDialogProps) {
  if (!stats) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md bg-[#090d19]/95 backdrop-blur-2xl border-white/10 text-foreground">
        <DialogHeader className="text-center flex flex-col items-center">
          {stats.isNewRecord ? (
            <div className="p-3 rounded-2xl bg-portal-mint text-[#07150f] mb-2 animate-bounce shadow-lg shadow-portal-mint/30">
              <Trophy className="size-8" />
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-portal-mint/10 text-portal-mint mb-2 border border-portal-mint/20">
              <Sparkles className="size-8" />
            </div>
          )}

          <DialogTitle className="font-display text-2xl font-extrabold tracking-tight">
            {stats.isNewRecord ? "New High Score!" : "Game Over!"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-xs uppercase tracking-wider mt-1">
            Fast Math Challenge ({stats.difficulty} • {stats.operation} • {stats.gameMode})
          </DialogDescription>
        </DialogHeader>

        {/* Main Score Display */}
        <div className="flex flex-col items-center justify-center p-4 my-2 rounded-2xl bg-white/[0.03] border border-white/10">
          <span className="text-xs font-bold uppercase tracking-wider text-portal-mint">
            Final Score
          </span>
          <span className="font-display text-4xl font-extrabold text-portal-mint mt-1">
            {stats.score}
          </span>
        </div>

        {/* Detailed Stats Grid */}
        <div className="grid grid-cols-2 gap-3 my-2">
          {/* Reaction Time */}
          <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-portal-blue/10 border border-portal-blue/20">
            <div className="flex items-center gap-1 text-xs font-bold text-portal-blue uppercase tracking-wider">
              <Zap className="size-3.5" /> Avg Speed
            </div>
            <span className="text-xl font-mono font-bold text-foreground mt-1">
              {stats.avgReactionTimeMs} <span className="text-xs font-normal text-muted-foreground">ms</span>
            </span>
          </div>

          {/* Accuracy */}
          <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-400 uppercase tracking-wider">
              <Target className="size-3.5" /> Accuracy
            </div>
            <span className="text-xl font-mono font-bold text-emerald-300 mt-1">
              {stats.accuracy}%
            </span>
          </div>

          {/* Max Streak */}
          <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-portal-yellow/10 border border-portal-yellow/20">
            <div className="flex items-center gap-1 text-xs font-bold text-portal-yellow uppercase tracking-wider">
              <Flame className="size-3.5" /> Max Streak
            </div>
            <span className="text-xl font-mono font-bold text-portal-yellow mt-1">
              {stats.maxStreak}
            </span>
          </div>

          {/* Correct / Wrong ratio */}
          <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-portal-violet/10 border border-portal-violet/20">
            <span className="text-xs font-bold text-portal-violet uppercase tracking-wider">
              Correct / Wrong
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-base font-bold text-emerald-400 flex items-center gap-0.5">
                <CheckCircle className="size-4" /> {stats.correctAnswers}
              </span>
              <span className="text-muted-foreground font-light">/</span>
              <span className="text-base font-bold text-rose-400 flex items-center gap-0.5">
                <XCircle className="size-4" /> {stats.wrongAnswers}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col gap-2 sm:justify-center mt-2">
          <Button
            size="lg"
            onClick={onPlayAgain}
            className="w-full bg-portal-mint text-[#07150f] font-extrabold hover:bg-portal-mint/90 rounded-xl"
          >
            <RotateCcw className="size-4 mr-2" />
            Play Again
          </Button>

          <Link href="/arena" className="w-full">
            <Button
              variant="outline"
              size="lg"
              className="w-full border-white/10 bg-white/5 hover:bg-white/10 font-bold rounded-xl"
            >
              <Swords className="size-4 mr-2 text-portal-mint" />
              Compete 1v1 in Arena
            </Button>
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
