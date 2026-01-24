import Link from "next/link";
import { ArrowLeft, Brain, Grid3X3, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GameHeaderProps {
  level: number;
  score: number;
  gridSize: number;
}

export function GameHeader({ level, score, gridSize }: GameHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full max-w-md">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/games">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Link>
      </Button>
      
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-sm">
          <Brain className="h-4 w-4 text-violet-500" />
          <span className="text-muted-foreground">Level</span>
          <span className="font-bold text-foreground">{level}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          <Trophy className="h-4 w-4 text-amber-500" />
          <span className="text-muted-foreground">Score</span>
          <span className="font-bold text-foreground">{score}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          <Grid3X3 className="h-4 w-4 text-cyan-500" />
          <span className="font-bold text-foreground">{gridSize}×{gridSize}</span>
        </div>
      </div>
    </div>
  );
}
