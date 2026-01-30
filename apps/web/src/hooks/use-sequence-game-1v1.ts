import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useArenaStore } from "@/store/arena.store";
import { useAuthStore } from "@/store/auth.store";
import { useArenaGame } from "./use-arena-game";

/**
 * Hook for 1v1 Sequence Memory game
 * Combines socket communication (useArenaGame) with local game logic
 */
export function useSequenceGame1v1() {
  const router = useRouter();
  const { match, resetArena } = useArenaStore();
  const { user } = useAuthStore();

  // Socket game state
  const arenaGame = useArenaGame();
  const { gameStatus, sequence, level, sendReady, sendMove } = arenaGame;

  // Local UI state
  const [showingSequence, setShowingSequence] = useState(false);
  const [activeCell, setActiveCell] = useState<number | null>(null);
  const [clickedCell, setClickedCell] = useState<number | null>(null);
  const [playerIndex, setPlayerIndex] = useState(0);
  const [waitingForOpponent, setWaitingForOpponent] = useState(false);

  // Refs for animation control
  const animationRef = useRef<boolean>(false);
  const lastSequenceRef = useRef<string>("");

  // Redirect if no match
  useEffect(() => {
    if (!match) {
      router.push("/arena");
    }
  }, [match, router]);

  // Auto-send ready when page loads
  useEffect(() => {
    if (match && gameStatus === "waiting") {
      const timer = setTimeout(sendReady, 1000);
      return () => clearTimeout(timer);
    }
  }, [match, gameStatus, sendReady]);

  // Show sequence animation - memoized without sequence in deps
  const showSequenceAnimation = useCallback(async (seq: number[]) => {
    if (animationRef.current) return;
    animationRef.current = true;

    setShowingSequence(true);
    setPlayerIndex(0);

    for (let i = 0; i < seq.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 600));
      setActiveCell(seq[i]);
      await new Promise((resolve) => setTimeout(resolve, 400));
      setActiveCell(null);
    }

    await new Promise((resolve) => setTimeout(resolve, 300));
    setShowingSequence(false);
    animationRef.current = false;
  }, []);

  // Trigger sequence animation when game starts or level changes
  useEffect(() => {
    if (gameStatus === "playing" && sequence.length > 0) {
      // Compare sequence to prevent duplicate animations
      const sequenceKey = sequence.join(",");
      if (sequenceKey !== lastSequenceRef.current) {
        lastSequenceRef.current = sequenceKey;
        showSequenceAnimation(sequence);
      }
    }
  }, [gameStatus, sequence, level, showSequenceAnimation]);

  // Handle cell click
  const handleCellClick = useCallback(
    (cellIndex: number) => {
      if (showingSequence || gameStatus !== "playing") return;

      // Set clicked cell for visual feedback
      setClickedCell(cellIndex);
      setTimeout(() => setClickedCell(null), 150);

      // Update local state for immediate feedback
      if (sequence[playerIndex] === cellIndex) {
        const newIndex = playerIndex + 1;
        setPlayerIndex(newIndex);
        // Check if player completed the sequence
        if (newIndex >= sequence.length) {
          setWaitingForOpponent(true);
        }
      }

      // Send move to server (server validates)
      sendMove(cellIndex);
    },
    [showingSequence, gameStatus, sequence, playerIndex, sendMove],
  );

  // Handle back to arena
  const handleBackToArena = useCallback(() => {
    resetArena();
    router.push("/arena");
  }, [resetArena, router]);

  // Reset player index when sequence changes (new level)
  useEffect(() => {
    setPlayerIndex(0);
    setWaitingForOpponent(false);
  }, [sequence]);

  return {
    // Match info
    match,
    user,

    // Game state from socket
    ...arenaGame,

    // Local UI state
    showingSequence,
    activeCell,
    clickedCell,
    playerIndex,
    waitingForOpponent,

    // Actions
    handleCellClick,
    handleBackToArena,
  };
}
