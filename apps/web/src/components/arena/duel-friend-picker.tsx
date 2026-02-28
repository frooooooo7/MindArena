"use client";

import { useState, useEffect, useCallback } from "react";
import { useFriends } from "@/hooks/use-friends";
import { useDuel } from "@/hooks/use-duel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/user-avatar";
import {
  Swords,
  Trophy,
  Gamepad2,
  Circle,
  Loader2,
  X,
  Clock,
} from "lucide-react";
import { GAME_TYPES } from "@/lib/games/game-types";

// Only games supported in duels
const DUEL_GAME_TYPES = GAME_TYPES.filter((g) =>
  ["sequence", "chimp"].includes(g.id),
);

interface DuelFriendPickerProps {
  preselectedFriendId?: string;
}

export function DuelFriendPicker({
  preselectedFriendId,
}: DuelFriendPickerProps = {}) {
  const {
    isPickerOpen,
    setPickerOpen,
    sendInvite,
    sentInvitation,
    isFriendOnline,
    preselectedFriendId: storePreselectedFriendId,
  } = useDuel();
  const { friends, loadFriends, loading: friendsLoading } = useFriends();

  const [selectedGameType, setSelectedGameType] = useState(
    DUEL_GAME_TYPES[0]?.id || "sequence",
  );
  const [rated, setRated] = useState(true);
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const effectivePreselectedFriendId =
    preselectedFriendId ?? storePreselectedFriendId;

  const tick = useCallback(() => {
    setCurrentTime(Date.now());
  }, []);

  // Load friends list when picker opens
  useEffect(() => {
    if (isPickerOpen) {
      loadFriends();
    }
  }, [isPickerOpen, loadFriends]);

  // Keep a local clock ticking while invitation is pending
  useEffect(() => {
    if (!sentInvitation?.expiresAt) return;

    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [sentInvitation?.expiresAt, tick]);

  const remainingSeconds = sentInvitation?.expiresAt
    ? Math.max(
        0,
        Math.ceil(
          (new Date(sentInvitation.expiresAt).getTime() - currentTime) / 1000,
        ),
      )
    : null;

  const handleSendInvite = useCallback(
    (targetUserId: string) => {
      sendInvite({
        targetUserId,
        gameType: selectedGameType,
        rated,
      });
    },
    [sendInvite, selectedGameType, rated],
  );

  const handleCancel = useCallback(() => {
    setPickerOpen(false);
  }, [setPickerOpen]);

  // Resolve the name of the friend we're waiting on
  const waitingFriendName = sentInvitation?.targetId
    ? (friends.find((fr) => fr.friend?.id === sentInvitation.targetId)?.friend
        ?.name ?? "opponent")
    : null;

  // Filter: only accepted friends
  const acceptedFriends = friends.filter((f) => f.status === "ACCEPTED");

  // Sort: online first, preselected friend at top
  const sortedFriends = [...acceptedFriends].sort((a, b) => {
    // Preselected friend always first
    if (effectivePreselectedFriendId) {
      if (a.friend?.id === effectivePreselectedFriendId) return -1;
      if (b.friend?.id === effectivePreselectedFriendId) return 1;
    }
    const aOnline = isFriendOnline(a.friend?.id || "") ? 1 : 0;
    const bOnline = isFriendOnline(b.friend?.id || "") ? 1 : 0;
    return bOnline - aOnline;
  });

  // Whether we are in "waiting for response" state
  const isWaiting = !!sentInvitation;

  return (
    <Dialog open={isPickerOpen} onOpenChange={setPickerOpen}>
      <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-xl border-border/40">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Swords className="h-5 w-5 text-cyan-400" />
            Challenge a Friend
          </DialogTitle>
          <DialogDescription>
            {isWaiting
              ? "Waiting for your opponent to respond..."
              : "Select game type, mode, and pick an online friend to duel."}
          </DialogDescription>
        </DialogHeader>

        {isWaiting ? (
          /* ── Waiting State ── */
          <div className="flex flex-col items-center gap-4 py-6">
            <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
            <p className="text-sm font-medium text-center">
              Waiting for{" "}
              <span className="text-cyan-400">{waitingFriendName}</span> to
              accept...
            </p>
            {remainingSeconds !== null && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>
                  Expires in {Math.floor(remainingSeconds / 60)}:
                  {String(remainingSeconds % 60).padStart(2, "0")}
                </span>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="mt-2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
          </div>
        ) : (
          <>
            {/* Game Type Selection */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Game Type
              </p>
              <div className="flex gap-2">
                {DUEL_GAME_TYPES.map((game) => (
                  <button
                    key={game.id}
                    onClick={() => setSelectedGameType(game.id)}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50 ${
                      selectedGameType === game.id
                        ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-400"
                        : "border-border/40 bg-secondary/30 text-muted-foreground hover:bg-secondary/50"
                    }`}
                  >
                    <game.icon className="h-4 w-4" />
                    {game.shortName || game.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Ranked/Casual Toggle */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Match Type
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setRated(true)}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 ${
                    rated
                      ? "border-amber-500/50 bg-amber-500/10 text-amber-400"
                      : "border-border/40 bg-secondary/30 text-muted-foreground hover:bg-secondary/50"
                  }`}
                >
                  <Trophy className="h-4 w-4" />
                  Ranked
                </button>
                <button
                  onClick={() => setRated(false)}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 ${
                    !rated
                      ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400"
                      : "border-border/40 bg-secondary/30 text-muted-foreground hover:bg-secondary/50"
                  }`}
                >
                  <Gamepad2 className="h-4 w-4" />
                  Casual
                </button>
              </div>
            </div>

            {/* Friends List */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Select Opponent
              </p>
              <div className="max-h-60 overflow-y-auto space-y-1 pr-1">
                {friendsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : sortedFriends.length === 0 ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    No friends yet. Add friends to challenge them!
                  </div>
                ) : (
                  sortedFriends.map((friendship) => {
                    const friend = friendship.friend;
                    if (!friend) return null;
                    const isOnline = isFriendOnline(friend.id);
                    const isSending = false;
                    const isPreselected =
                      friend.id === effectivePreselectedFriendId;

                    return (
                      <div
                        key={friendship.id}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                          isPreselected
                            ? "border-cyan-500/30 bg-cyan-500/5 ring-1 ring-cyan-500/20"
                            : isOnline
                              ? "border-border/40 bg-secondary/20 hover:bg-secondary/40"
                              : "border-border/20 bg-secondary/5 opacity-50"
                        }`}
                      >
                        {/* Avatar with online indicator */}
                        <div className="relative shrink-0">
                          <UserAvatar
                            name={friend.name}
                            avatarUrl={friend.avatarUrl ?? null}
                            size="sm"
                          />
                          <Circle
                            className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 fill-current ring-2 ring-background rounded-full ${
                              isOnline ? "text-emerald-400" : "text-zinc-600"
                            }`}
                          />
                        </div>

                        {/* Name */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {friend.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {isOnline ? "Online" : "Offline"}
                          </p>
                        </div>

                        {/* Challenge Button */}
                        <Button
                          size="sm"
                          disabled={!isOnline || isWaiting}
                          onClick={() => handleSendInvite(friend.id)}
                          className="h-8 px-3 text-xs rounded-lg bg-linear-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white disabled:opacity-40"
                        >
                          {isSending ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <>
                              <Swords className="h-3 w-3 mr-1" />
                              Challenge
                            </>
                          )}
                        </Button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
