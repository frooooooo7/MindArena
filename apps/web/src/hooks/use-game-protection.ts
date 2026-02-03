import { useEffect, useRef } from "react";
import { socket } from "@/lib/socket";
import { useArenaStore } from "@/store/arena.store";
import { GAME_EVENTS } from "@mindarena/shared";

interface UseGameProtectionProps {
  gameStatus: string;
  gameResult: unknown;
  matchCancelled: boolean;
  /**
   * Statuses during which users should be warned/forfeit if they leave
   * Default: ["playing", "countdown"]
   */
  activeStatuses?: string[];
}

/**
 * Hook to protect games from accidental navigation
 * Handles:
 * 1. Browser refresh/close warning (beforeunload)
 * 2. Internal link navigation warning (global click listener)
 * 3. Automatic forfeit on unmount if game is active
 */
export function useGameProtection({
  gameStatus,
  gameResult,
  matchCancelled,
  activeStatuses = ["playing", "countdown"],
}: UseGameProtectionProps) {

  // Refs for state tracking in cleanup
  const gameStatusRef = useRef(gameStatus);
  const matchCancelledRef = useRef(matchCancelled);
  const gameResultRef = useRef(gameResult);
  // Ref for activeStatuses to avoid dependency issues if array reference changes
  const activeStatusesRef = useRef(activeStatuses);

  useEffect(() => {
    gameStatusRef.current = gameStatus;
    matchCancelledRef.current = matchCancelled;
    gameResultRef.current = gameResult;
    activeStatusesRef.current = activeStatuses;
  }, [gameStatus, matchCancelled, gameResult, activeStatuses]);

  useEffect(() => {
    // 1. Browser Navigation Warning (Refresh/Close)
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const status = gameStatusRef.current;
      const statuses = activeStatusesRef.current;
      
      if (statuses.includes(status)) {
        e.preventDefault();
        e.returnValue = "";
        return "";
      }
    };

    // 2. Internal Navigation Warning (Next.js Links)
    const handleGlobalClick = (e: MouseEvent) => {
      const status = gameStatusRef.current;
      const statuses = activeStatusesRef.current;

      if (!statuses.includes(status)) return;

      const target = e.target as HTMLElement;
      const link = target.closest("a");
      if (link) {
        const href = link.getAttribute("href");
        // Skip anchors and javascript links
        if (href && !href.startsWith("#") && !href.startsWith("javascript:")) {
          if (
            !window.confirm(
              "Warning: Leaving the arena will forfeit the match. Are you sure?",
            )
          ) {
            e.preventDefault();
            e.stopPropagation();
          }
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("click", handleGlobalClick, true);

    // Cleanup: Remove listeners AND handle Forfeit
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("click", handleGlobalClick, true);

      const status = gameStatusRef.current;
      const result = gameResultRef.current;
      const cancelled = matchCancelledRef.current;
      const statuses = activeStatusesRef.current;

      // If game is active and we're unmounting without a natural end -> Forfeit
      if (statuses.includes(status) && !result && !cancelled) {
        console.log("[GameProtection] Unmounting active game -> Forfeit");
        socket.emit(GAME_EVENTS.LEAVE);
        useArenaStore.getState().resetArena();
      }
    };
  }, []);
}
