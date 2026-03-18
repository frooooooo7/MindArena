"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useDuel } from "@/hooks/use-duel";
import { DuelInvitation } from "@mindarena/shared";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Swords, X, Loader2, Trophy, Gamepad2 } from "lucide-react";

/**
 * Global duel invitation popup — renders in root layout.
 * Shows incoming duel invitations as toast-like popups.
 */
export function DuelInvitationListener() {
  const { pendingInvitations, acceptInvite, declineInvite } = useDuel();
  const [isClosing, setIsClosing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const autoHideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentInvitation: DuelInvitation | null =
    pendingInvitations[0] || null;

  const clearAutoHideTimer = useCallback(() => {
    if (autoHideTimerRef.current) {
      clearTimeout(autoHideTimerRef.current);
      autoHideTimerRef.current = null;
    }
  }, []);

  const closePopup = useCallback(() => {
    clearAutoHideTimer();
    setIsClosing(true);
    setTimeout(() => {
      if (currentInvitation) {
        declineInvite(currentInvitation.id);
      }
      setIsClosing(false);
      setIsLoading(false);
    }, 300);
  }, [clearAutoHideTimer, currentInvitation, declineInvite]);

  // Auto-decline after 30s if user doesn't respond (server has its own 5-min TTL)
  useEffect(() => {
    if (currentInvitation && !isClosing && !isLoading) {
      clearAutoHideTimer();
      autoHideTimerRef.current = setTimeout(() => {
        closePopup();
      }, 30000);
    }
    return () => clearAutoHideTimer();
  }, [currentInvitation, isClosing, isLoading, closePopup, clearAutoHideTimer]);

  const handleAccept = () => {
    if (!currentInvitation || isLoading) return;
    setIsLoading(true);
    clearAutoHideTimer();
    acceptInvite(currentInvitation.id);
    // After accept, the MATCH_FOUND event will redirect via useArena
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  const handleDecline = () => {
    if (!currentInvitation || isLoading) return;
    closePopup();
  };

  if (!currentInvitation) return null;

  const gameLabel =
    currentInvitation.gameType.charAt(0).toUpperCase() +
    currentInvitation.gameType.slice(1);

  return (
    <div
      key={currentInvitation.id}
      className={`fixed top-20 right-6 z-50 transition-all duration-300 ease-out ${
        isClosing
          ? "translate-x-8 opacity-0 scale-95"
          : "animate-in fade-in zoom-in-95 slide-in-from-right-8 slide-in-from-top-4 duration-500"
      }`}
    >
      <div className="w-80 rounded-2xl border border-cyan-500/20 bg-background/80 backdrop-blur-xl shadow-2xl shadow-cyan-500/10 overflow-hidden">
        {/* Gradient accent bar */}
        <div className="h-1 w-full bg-linear-to-r from-cyan-600 to-blue-600" />

        <button
          onClick={handleDecline}
          disabled={isLoading}
          aria-label="Close notification"
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors rounded-full p-0.5 hover:bg-secondary/40 disabled:opacity-50"
        >
          <X size={14} />
        </button>

        <div className="p-4 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <UserAvatar
                name={currentInvitation.inviterName}
                avatarUrl={currentInvitation.inviterAvatar ?? null}
              />
              <div className="absolute -bottom-0.5 -right-0.5 h-5 w-5 rounded-full bg-linear-to-br from-cyan-600 to-blue-600 flex items-center justify-center ring-2 ring-background">
                <Swords size={10} className="text-white" />
              </div>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">Duel Challenge!</p>
              <p className="text-xs text-muted-foreground truncate">
                <span className="font-medium text-cyan-400">
                  {currentInvitation.inviterName}
                </span>{" "}
                wants to battle
              </p>
            </div>
          </div>

          {/* Game details */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-secondary/50 border border-border/40">
              <Gamepad2 size={12} />
              <span>{gameLabel}</span>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-secondary/50 border border-border/40">
              {currentInvitation.rated ? (
                <>
                  <Trophy size={12} className="text-amber-400" />
                  <span>Ranked</span>
                </>
              ) : (
                <>
                  <Gamepad2 size={12} className="text-emerald-400" />
                  <span>Casual</span>
                </>
              )}
            </div>
          </div>

          <div className="flex gap-2 w-full mt-1">
            <Button
              variant="outline"
              size="sm"
              disabled={isLoading}
              className="flex-1 text-xs h-8 rounded-lg border-border/40 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30 transition-colors"
              onClick={handleDecline}
            >
              Decline
            </Button>
            <Button
              size="sm"
              disabled={isLoading}
              className="flex-1 text-xs h-8 rounded-lg bg-linear-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-md shadow-cyan-500/20 transition-all"
              onClick={handleAccept}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Accept"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
