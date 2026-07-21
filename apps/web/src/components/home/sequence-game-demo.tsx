"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, RotateCcw } from "lucide-react";

import { cn } from "@/lib/utils";

import {
  PREVIEW_SEQUENCE,
  acceptSequenceInput,
  beginPlayerTurn,
  createSequenceDemoState,
  resetSequenceDemo,
} from "./sequence-demo-engine";

const FLASH_STEP_MS = 520;
const FLASH_VISIBLE_MS = 280;
const FAILURE_RESET_MS = 1300;
const SUCCESS_RESET_MS = 2800;
const PRESS_FEEDBACK_MS = 160;

export function SequenceGameDemo() {
  const [state, setState] = useState(createSequenceDemoState);
  const [flashingCell, setFlashingCell] = useState<number | null>(null);
  const [pressedCell, setPressedCell] = useState<number | null>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const pressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const clearPhaseTimers = () => {
      timersRef.current.forEach((timer) => clearTimeout(timer));
      timersRef.current = [];
    };
    const schedule = (callback: () => void, delay: number) => {
      const timer = setTimeout(callback, delay);
      timersRef.current.push(timer);
    };

    clearPhaseTimers();

    if (state.phase === "watching") {
      PREVIEW_SEQUENCE.forEach((cell, index) => {
        const startAt = index * FLASH_STEP_MS;

        schedule(() => setFlashingCell(cell), startAt);
        schedule(() => setFlashingCell(null), startAt + FLASH_VISIBLE_MS);
      });
      schedule(() => {
        setState((current) => beginPlayerTurn(current));
      }, PREVIEW_SEQUENCE.length * FLASH_STEP_MS);
    }

    if (state.phase === "failure") {
      schedule(() => setState(resetSequenceDemo), FAILURE_RESET_MS);
    }

    if (state.phase === "success") {
      schedule(() => setState(resetSequenceDemo), SUCCESS_RESET_MS);
    }

    return () => {
      clearPhaseTimers();
      if (pressTimerRef.current) {
        clearTimeout(pressTimerRef.current);
        pressTimerRef.current = null;
      }
    };
  }, [state.phase]);

  const handleTilePress = (cell: number) => {
    if (state.phase !== "playing") {
      return;
    }

    const next = acceptSequenceInput(state, cell);

    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }

    if (next.phase !== "playing") {
      setPressedCell(null);
    } else {
      setPressedCell(cell);
      pressTimerRef.current = setTimeout(() => {
        setPressedCell(null);
        pressTimerRef.current = null;
      }, PRESS_FEEDBACK_MS);
    }

    setState(next);
  };

  const statusText =
    state.phase === "watching"
      ? "Watch the pattern"
      : state.phase === "playing"
        ? "Your turn"
        : state.phase === "success"
          ? "Perfect sequence! Replaying shortly."
          : "That was not the pattern. Replaying shortly.";
  const liveMessage =
    state.phase === "watching" && flashingCell !== null
      ? `Sequence tile ${flashingCell + 1}`
      : state.phase === "playing" && state.inputIndex > 0
        ? `Correct. ${state.inputIndex} of ${PREVIEW_SEQUENCE.length}`
      : statusText;

  return (
    <div className="w-full max-w-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="text-sm font-bold text-white">{statusText}</p>
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#aeb8d6]">
          {state.phase === "playing"
            ? `${state.inputIndex} / ${PREVIEW_SEQUENCE.length} selected`
            : `${PREVIEW_SEQUENCE.length} tile pattern`}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3" role="group" aria-label="Sequence memory board">
        {Array.from({ length: 9 }, (_, cell) => {
          const isFlashing = state.phase === "watching" && flashingCell === cell;
          const isPressed = state.phase === "playing" && pressedCell === cell;

          return (
            <motion.button
              key={cell}
              type="button"
              aria-label={`Sequence tile ${cell + 1}`}
              disabled={state.phase !== "playing"}
              onClick={() => handleTilePress(cell)}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.94 }}
              transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.16 }}
              className={cn(
                "aspect-square min-h-11 rounded-xl border text-sm font-black transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-portal-yellow disabled:cursor-not-allowed",
                shouldReduceMotion && "transition-none",
                state.phase === "playing"
                  ? "cursor-pointer border-[#8490bd]/65 bg-[#364069] text-white hover:border-portal-mint hover:bg-[#40507c]"
                  : "border-[#66719f]/45 bg-[#31395f]/80 text-[#b9c2dc]",
                (isFlashing || isPressed) &&
                  "border-portal-mint bg-portal-mint text-[#102631] shadow-[0_0_24px_rgb(112_245_193_/_0.6)]",
              )}
            >
              {cell + 1}
            </motion.button>
          );
        })}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
        <p className="flex items-center gap-2 text-sm font-semibold text-[#cbd1e2]">
          <RotateCcw className="size-4 text-portal-mint" aria-hidden="true" />
          The same pattern loops after every result.
        </p>
        <Link
          href="/games/sequence-memory"
          className={cn(
            "group inline-flex min-h-11 items-center gap-2 rounded-full bg-portal-yellow px-4 text-sm font-extrabold text-[#191307] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-portal-yellow",
            !shouldReduceMotion && "transition-transform hover:-translate-y-0.5",
          )}
        >
          Play full game
          <ArrowRight
            className={cn(
              "size-4",
              !shouldReduceMotion && "transition-transform group-hover:translate-x-1",
            )}
            aria-hidden="true"
          />
        </Link>
      </div>

      <p className="sr-only" aria-live="polite">
        {liveMessage}
      </p>
    </div>
  );
}
