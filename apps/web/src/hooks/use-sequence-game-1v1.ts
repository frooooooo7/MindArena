import { useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { socket } from "@/lib/socket";
import { useArenaStore } from "@/store/arena.store";
import { useSequenceStore } from "@/store/game/sequence.store";
import {
  GAME_EVENTS,
  ARENA_EVENTS,
  GameStartPayload,
  LevelCompletePayload,
  OpponentProgressPayload,
  RoundTimerPayload,
  GameEndPayload,
} from "@mindarena/shared";
import { useGameProtection } from "./use-game-protection";

/**
 * Hook for 1v1 Sequence Memory game
 * Handles initialization, socket subscriptions, and animations.
 * State is now in useSequenceStore.
 */
export function useSequenceGame1v1() {
  const router = useRouter();
  const { match, resetArena } = useArenaStore();
  
  // Connect store to global match state on mount
  useEffect(() => {
    if (match) {
      useSequenceStore.getState().setMatch(match);
    }
    return () => useSequenceStore.getState().resetGame();
  }, [match]);

  // Game Protection (Forfeit on leave)
  const status = useSequenceStore(s => s.status);
  useGameProtection({
    gameStatus: status,
    activeStatuses: ["playing", "countdown"],
    gameResult: useSequenceStore.getState().gameResult,
    matchCancelled: useSequenceStore.getState().matchCancelled,
  });

  const roomId = match?.room || "";
  const animationRef = useRef<boolean>(false);
  const lastSequenceRef = useRef<string>("");

  // Refs for animation control (Directly modify store)
  const showSequenceAnimation = useCallback(async (seq: number[]) => {
    if (animationRef.current) return;
    animationRef.current = true;
    const store = useSequenceStore.getState();

    store.setShowingSequence(true);

    for (let i = 0; i < seq.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 600));
      store.setActiveCell(seq[i]);
      await new Promise((resolve) => setTimeout(resolve, 400));
      store.setActiveCell(null);
    }

    await new Promise((resolve) => setTimeout(resolve, 300));
    store.setShowingSequence(false);
    animationRef.current = false;
  }, []);

  // Socket Subscriptions
  useEffect(() => {
    if (!roomId) return;
    const store = useSequenceStore.getState();

    const handleCountdown = (data: { seconds: number }) => {
      store.setStatus("countdown");
      store.setCountdown(data.seconds);
    };

    const handleGameStart = (data: GameStartPayload) => {
      store.startGame(data);
    };

    const handleMoveResult = (data: { correct: boolean; sequenceComplete: boolean }) => {
      // Logic handled optimistically on client, server just validates
    };

    const handleOpponentProgress = (data: OpponentProgressPayload) => {
      store.updateOpponent(data);
    };

    const handleMatchCancelled = (data: { reason: string }) => {
      store.setMatchCancelled(true);
    };

    const handleLevelComplete = (data: LevelCompletePayload) => {
        store.updateLevel(data);
    };

    const handleRoundTimer = (data: RoundTimerPayload) => {
      store.setTimeLeft(data.timeLeft);
    };

    const handleGameEnd = (data: GameEndPayload) => {
        // Need current user name to determine winner
        const currentUserName = match?.user?.name || "Player"; 
        store.endGame(data, currentUserName);
    };

    socket.on(GAME_EVENTS.COUNTDOWN, handleCountdown);
    socket.on(GAME_EVENTS.START, handleGameStart);
    socket.on(GAME_EVENTS.MOVE_RESULT, handleMoveResult);
    socket.on(GAME_EVENTS.OPPONENT_PROGRESS, handleOpponentProgress);
    socket.on(ARENA_EVENTS.MATCH_CANCELLED, handleMatchCancelled);
    socket.on(GAME_EVENTS.LEVEL_COMPLETE, handleLevelComplete);
    socket.on(GAME_EVENTS.ROUND_TIMER, handleRoundTimer);
    socket.on(GAME_EVENTS.END, handleGameEnd);

    // Auto-Send Ready
    if (store.status === "waiting") {
        setTimeout(() => {
            console.log("Sending READY");
            socket.emit(GAME_EVENTS.READY, { roomId });
        }, 1000);
    }

    return () => {
      socket.off(GAME_EVENTS.COUNTDOWN, handleCountdown);
      socket.off(GAME_EVENTS.START, handleGameStart);
      socket.off(GAME_EVENTS.MOVE_RESULT, handleMoveResult);
      socket.off(GAME_EVENTS.OPPONENT_PROGRESS, handleOpponentProgress);
      socket.off(ARENA_EVENTS.MATCH_CANCELLED, handleMatchCancelled);
      socket.off(GAME_EVENTS.LEVEL_COMPLETE, handleLevelComplete);
      socket.off(GAME_EVENTS.ROUND_TIMER, handleRoundTimer);
      socket.off(GAME_EVENTS.END, handleGameEnd);
    };
  }, [roomId, match]);

  // Animation Trigger
  const sequence = useSequenceStore(s => s.sequence);
  const gameStatus = useSequenceStore(s => s.status);
  
  useEffect(() => {
      // Trigger animation only if we are playing and sequence changed
      if (gameStatus === "playing" && sequence.length > 0) {
        const sequenceKey = sequence.join(",");
        if (sequenceKey !== lastSequenceRef.current) {
          lastSequenceRef.current = sequenceKey;
          showSequenceAnimation(sequence);
        }
      }
  }, [sequence, gameStatus, showSequenceAnimation]);

  // Actions
  const handleBackToArena = useCallback(() => {
    resetArena();
    router.push("/arena");
  }, [resetArena, router]);

  const handleCellClick = useCallback((cellIndex: number) => {
      const store = useSequenceStore.getState();
      
      // Validation
      if (store.showingSequence || store.status !== "playing") return;

      // Optimistic Updates
      store.setClickedCell(cellIndex);
      setTimeout(() => store.setClickedCell(null), 150);

      const expectedCell = store.sequence[store.currentIndex];
      
      if (cellIndex === expectedCell) {
          store.incrementIndex(); // Move to next
          // If level complete, waiting...
          if (store.currentIndex + 1 >= store.sequence.length) {
              // Wait for server LEVEl_COMPLETE
              store.setStatus("level-complete"); 
          }
      }

      // Send to server
      socket.emit(GAME_EVENTS.MOVE, { roomId, cellIndex });

  }, [roomId]);

  // Redirect if no match
  useEffect(() => {
    if (!match) {
      router.push("/arena");
    }
  }, [match, router]);

  return {
    handleBackToArena,
    handleCellClick
  };
}
