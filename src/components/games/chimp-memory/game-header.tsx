import Link from "next/link";
import { ArrowLeft, Brain, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GameHeaderProps {
  level: number;
  numbersCount: number;
  nextNumber: number;
}

export function GameHeader({ level, numbersCount, nextNumber }: GameHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full max-w-lg">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/games">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Link>
      </Button>
      
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-sm">
          <Brain className="h-4 w-4 text-amber-500" />
          <span className="text-muted-foreground">Level</span>
          <span className="font-bold text-foreground">{level}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          <Hash className="h-4 w-4 text-emerald-500" />
          <span className="text-muted-foreground">Numbers</span>
          <span className="font-bold text-foreground">{numbersCount}</span>
        </div>
      </div>
    </div>
  );
}
