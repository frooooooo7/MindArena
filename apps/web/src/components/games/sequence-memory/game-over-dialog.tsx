"use client";

import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy, Brain, Grid3X3, RotateCcw, Home } from "lucide-react";
import Link from "next/link";

interface GameOverDialogProps {
  open: boolean;
  level: number;
  score: number;
  gridSize: number;
  onPlayAgain: () => void;
}

export function GameOverDialog({
  open,
  level,
  score,
  gridSize,
  onPlayAgain,
}: GameOverDialogProps) {
  const router = useRouter();

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      router.push("/games");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-bold text-center">
            Game Over!
          </DialogTitle>
          <DialogDescription className="text-center">
            Great effort! Here's your game summary.
          </DialogDescription>
        </DialogHeader>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 py-6">
          <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-violet-500/10 border border-violet-500/20">
            <Brain className="h-6 w-6 text-violet-500" />
            <span className="text-2xl font-bold">{level}</span>
            <span className="text-xs text-muted-foreground">Level</span>
          </div>
          
          <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <Trophy className="h-6 w-6 text-amber-500" />
            <span className="text-2xl font-bold">{score}</span>
            <span className="text-xs text-muted-foreground">Score</span>
          </div>
          
          <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
            <Grid3X3 className="h-6 w-6 text-cyan-500" />
            <span className="text-2xl font-bold">{gridSize}×{gridSize}</span>
            <span className="text-xs text-muted-foreground">Max Grid</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={onPlayAgain}
            className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Play Again
          </Button>
          <Button variant="outline" asChild className="flex-1">
            <Link href="/games">
              <Home className="mr-2 h-4 w-4" />
              Back to Games
            </Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
