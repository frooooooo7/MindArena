"use client";

import { useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import type { GameState } from "@/lib/games/code-memory";

interface CodeInputProps {
  value: string;
  codeLength: number;
  gameState: GameState;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

export function CodeInput({
  value,
  codeLength,
  gameState,
  onChange,
  onSubmit,
}: CodeInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isInputPhase = gameState === "input";

  // Auto-focus when entering input phase
  useEffect(() => {
    if (isInputPhase && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isInputPhase]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && isInputPhase) {
      e.preventDefault();
      e.stopPropagation();
      onSubmit();
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-sm">
      <div className="relative w-full">
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={!isInputPhase}
          placeholder={isInputPhase ? "Type the code..." : ""}
          maxLength={codeLength}
          className="h-14 text-center text-2xl font-mono tracking-widest uppercase"
          autoComplete="off"
        />
      </div>

      {isInputPhase && (
        <Button
          onClick={onSubmit}
          disabled={value.length !== codeLength}
          className="w-full h-12 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-lg shadow-cyan-500/25"
        >
          <Send className="mr-2 h-5 w-5" />
          Submit Answer
        </Button>
      )}
    </div>
  );
}

