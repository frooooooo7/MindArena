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
import { Badge } from "@/components/ui/badge";
import { GameStats, GridSize, OrderDirection } from "@/lib/games/schulte-table/types";
import { formatTime } from "./GameHeader";
import { Trophy, Zap, Target, AlertTriangle, RotateCcw, Sparkles } from "lucide-react";

interface GameOverDialogProps {
  open: boolean;
  stats: GameStats | null;
  gridSize: GridSize;
  orderDirection: OrderDirection;
  onPlayAgain: () => void;
  onClose: () => void;
}

export function GameOverDialog({
  open,
  stats,
  gridSize,
  orderDirection,
  onPlayAgain,
  onClose,
}: GameOverDialogProps) {
  if (!stats) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border-amber-500/20">
        <DialogHeader className="text-center flex flex-col items-center">
          {stats.isNewRecord ? (
            <div className="p-3 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-black mb-2 animate-bounce shadow-lg shadow-amber-500/30">
              <Trophy className="w-8 h-8" />
            </div>
          ) : (
            <div className="p-3 rounded-full bg-amber-500/10 text-amber-400 mb-2 border border-amber-500/20">
              <Sparkles className="w-8 h-8" />
            </div>
          )}

          <DialogTitle className="text-2xl font-extrabold tracking-tight">
            {stats.isNewRecord ? "Nowy Rekord!" : "Ukończono Grę!"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            Wykonałeś wyzwanie Schulte Table {gridSize}x{gridSize} (
            {orderDirection === "asc" ? "1 → N" : "N → 1"})
          </DialogDescription>
        </DialogHeader>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 my-4">
          {/* Time */}
          <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <span className="text-xs font-semibold text-amber-500 uppercase tracking-wider">
              Czas
            </span>
            <span className="text-2xl font-mono font-bold text-amber-400 mt-1">
              {formatTime(stats.elapsedMs)}
            </span>
          </div>

          {/* CPS */}
          <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
            <div className="flex items-center gap-1 text-xs font-semibold text-cyan-400 uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5" /> Speed
            </div>
            <span className="text-2xl font-mono font-bold text-cyan-300 mt-1">
              {stats.clicksPerSecond} <span className="text-xs font-normal">klik/s</span>
            </span>
          </div>

          {/* Accuracy */}
          <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="flex items-center gap-1 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              <Target className="w-3.5 h-3.5" /> Celność
            </div>
            <span className="text-2xl font-mono font-bold text-emerald-300 mt-1">
              {stats.accuracy}%
            </span>
          </div>

          {/* Mistakes */}
          <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
            <div className="flex items-center gap-1 text-xs font-semibold text-rose-400 uppercase tracking-wider">
              <AlertTriangle className="w-3.5 h-3.5" /> Błędy
            </div>
            <span className="text-2xl font-mono font-bold text-rose-300 mt-1">
              {stats.mistakes}
            </span>
          </div>
        </div>

        <DialogFooter className="sm:justify-center">
          <Button
            size="lg"
            onClick={onPlayAgain}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-black font-extrabold shadow-lg shadow-amber-500/20"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Zagraj Ponownie
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
