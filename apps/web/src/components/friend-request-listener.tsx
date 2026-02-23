"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { socket, connectSocket, disconnectSocket } from "@/lib/socket";
import type { FriendshipDTO } from "@mindarena/shared";
import { Button } from "@/components/ui/button";
import { UserPlus, X, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { api } from "@/lib/axios";
import { toast } from "sonner";

/**
 * Custom event dispatched after accepting/rejecting a friend request
 * from the popup. The useFriends hook listens for this to sync state.
 */
export const FRIEND_ACTION_EVENT = "friend-list-updated";

export function FriendRequestListener() {
  const { user, accessToken } = useAuthStore();
  const [requestsQueue, setRequestsQueue] = useState<FriendshipDTO[]>([]);
  const [isClosing, setIsClosing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const autoHideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentRequest = requestsQueue[0] || null;

  /** Clear any pending auto-hide timer */
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
      setRequestsQueue((prev) => prev.slice(1));
      setIsClosing(false);
      setIsLoading(false);
    }, 300); // match animation duration
  }, [clearAutoHideTimer]);

  useEffect(() => {
    if (!user || !accessToken) {
      disconnectSocket();
      return;
    }

    // Ensure socket is connected for the authenticated user
    connectSocket(accessToken);

    const handleRequestReceived = (newReq: FriendshipDTO) => {
      setRequestsQueue((prev) => {
        // Prevent duplicates in queue
        if (prev.some((req) => req.id === newReq.id)) return prev;
        return [...prev, newReq];
      });
    };

    socket.on("FRIEND_REQUEST_RECEIVED", handleRequestReceived);

    return () => {
      socket.off("FRIEND_REQUEST_RECEIVED", handleRequestReceived);
    };
  }, [user, accessToken]);

  // Handle auto-hide timer for current request
  useEffect(() => {
    if (currentRequest && !isClosing && !isLoading) {
      clearAutoHideTimer();
      autoHideTimerRef.current = setTimeout(() => {
        closePopup();
      }, 10000);
    }
    return () => clearAutoHideTimer();
  }, [currentRequest, isClosing, isLoading, closePopup, clearAutoHideTimer]);

  /** Notify useFriends hook that the friend list needs a refresh */
  const notifyFriendListUpdate = () => {
    window.dispatchEvent(new CustomEvent(FRIEND_ACTION_EVENT));
  };

  const handleAccept = async () => {
    if (!currentRequest || isLoading) return;
    setIsLoading(true);
    clearAutoHideTimer(); // Stop it from auto-hiding while loading
    try {
      await api.put(`/friends/requests/${currentRequest.id}/accept`);
      notifyFriendListUpdate();
      toast.success(`Accepted friend request from ${currentRequest.friend?.name}`);
      closePopup();
    } catch (err: any) {
      console.error("Failed to accept friend request", err);
      toast.error("Failed to accept request", {
        description: err.response?.data?.message || "An unexpected error occurred.",
      });
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    if (!currentRequest || isLoading) return;
    setIsLoading(true);
    clearAutoHideTimer();
    try {
      await api.delete(`/friends/requests/${currentRequest.id}`);
      notifyFriendListUpdate();
      closePopup();
    } catch (err: any) {
      console.error("Failed to reject friend request", err);
      toast.error("Failed to decline request", {
        description: err.response?.data?.message || "An unexpected error occurred.",
      });
      setIsLoading(false);
    }
  };

  if (!currentRequest || !currentRequest.friend) return null;

  return (
    <div
      key={currentRequest.id}
      className={`fixed top-20 right-6 z-50 transition-all duration-300 ease-out ${
        isClosing
          ? "translate-x-8 opacity-0 scale-95"
          : "animate-in fade-in zoom-in-95 slide-in-from-right-8 slide-in-from-top-4 duration-500"
      }`}
    >
      <div className="w-80 rounded-2xl border border-violet-500/20 bg-background/80 backdrop-blur-xl shadow-2xl shadow-violet-500/10 overflow-hidden">
        {/* Gradient accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-violet-600 to-indigo-600" />

        <button
          onClick={closePopup}
          disabled={isLoading}
          aria-label="Close notification"
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors rounded-full p-0.5 hover:bg-secondary/40 disabled:opacity-50"
        >
          <X size={14} />
        </button>

        <div className="p-4 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 shrink-0 flex items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/20">
              <UserPlus size={18} className="text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">Friend Request</p>
              <p className="text-xs text-muted-foreground truncate">
                <span className="font-medium text-violet-400">{currentRequest.friend.name}</span>{" "}
                wants to connect
              </p>
            </div>
          </div>

          <div className="flex gap-2 w-full mt-1">
            <Button
              variant="outline"
              size="sm"
              disabled={isLoading}
              className="flex-1 text-xs h-8 rounded-lg border-border/40 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30 transition-colors"
              onClick={handleReject}
            >
              Decline
            </Button>
            <Button
              size="sm"
              disabled={isLoading}
              className="flex-1 text-xs h-8 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-md shadow-violet-500/20 transition-all"
              onClick={handleAccept}
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Accept"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
