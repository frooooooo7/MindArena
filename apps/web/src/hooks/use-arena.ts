import { useEffect, useCallback, useState } from "react";
import { socket, connectSocket } from "@/lib/socket";
import { useAuthStore } from "@/store/auth.store";
import { useArenaStore } from "@/store/arena.store";
import { ArenaMatch, ARENA_EVENTS } from "@mindarena/shared";

// Connection error types for user feedback
type ConnectionError = "not_connected" | "rate_limited" | null;

export function useArena() {
    const { accessToken, isAuthenticated } = useAuthStore();
    const { isSearching, match, setSearching, setMatch, resetArena } = useArenaStore();
    const [connectionError, setConnectionError] = useState<ConnectionError>(null);
    const [matchCancelled, setMatchCancelled] = useState(false);

    useEffect(() => {
        if (isAuthenticated && accessToken && !socket.connected) {
            console.log("[useArena] Connecting to socket...");
            connectSocket(accessToken);
        }

        const handleMatchFound = (data: ArenaMatch) => {
            console.log("[useArena] Match found:", data);
            setConnectionError(null);
            setMatchCancelled(false);
            setMatch(data);
        };

        const handleMatchCancelled = (data: { reason: string }) => {
            console.log("[useArena] Match cancelled:", data.reason);
            setMatchCancelled(true);
        };

        const handleQueueStatus = (data: { position: number; estimatedWait: string; error?: string }) => {
            console.log("[useArena] Queue status:", data);
            
            // Handle queue errors
            if (data.error) {
                if (data.estimatedWait === "rate_limited") {
                    setConnectionError("rate_limited");
                }
            } else {
                setConnectionError(null);
            }
        };

        const handleConnect = () => {
            console.log("[useArena] Socket connected!");
            setConnectionError(null);
        };
        
        const handleDisconnect = (reason: string) => {
            console.log("[useArena] Socket disconnected:", reason);
            setConnectionError("not_connected");
            // If disconnected while searching, reset state
            if (isSearching) {
                resetArena();
            }
        };
        
        const handleError = (err: Error) => {
            console.error("[useArena] Socket error:", err.message);
            setConnectionError("not_connected");
        };

        socket.on("connect", handleConnect);
        socket.on("disconnect", handleDisconnect);
        socket.on("connect_error", handleError);
        socket.on(ARENA_EVENTS.MATCH_FOUND, handleMatchFound);
        socket.on(ARENA_EVENTS.MATCH_CANCELLED, handleMatchCancelled);
        socket.on(ARENA_EVENTS.QUEUE_STATUS, handleQueueStatus);

        return () => {
            socket.off("connect", handleConnect);
            socket.off("disconnect", handleDisconnect);
            socket.off("connect_error", handleError);
            socket.off(ARENA_EVENTS.MATCH_FOUND, handleMatchFound);
            socket.off(ARENA_EVENTS.MATCH_CANCELLED, handleMatchCancelled);
            socket.off(ARENA_EVENTS.QUEUE_STATUS, handleQueueStatus);
        };
    }, [isAuthenticated, accessToken, setMatch, isSearching, resetArena]);

    const joinQueue = useCallback((gameType: string): { success: boolean; error?: string } => {
        if (!socket.connected) {
            console.error("[useArena] Cannot join queue - socket not connected");
            setConnectionError("not_connected");
            return { success: false, error: "Not connected to server. Please refresh the page." };
        }
        
        console.log(`[useArena] Joining queue for: ${gameType}`);
        setConnectionError(null);
        setMatchCancelled(false);
        setSearching(true, gameType);
        socket.emit(ARENA_EVENTS.JOIN_QUEUE, { gameType });
        return { success: true };
    }, [setSearching]);

    const leaveQueue = useCallback(() => {
        console.log("[useArena] Leaving queue");
        // Notify server that user is leaving the queue
        if (socket.connected) {
            socket.emit(ARENA_EVENTS.LEAVE_QUEUE);
        }
        resetArena();
        setMatchCancelled(false);
    }, [resetArena]);

    return {
        isSearching,
        match,
        joinQueue,
        leaveQueue,
        connectionError,
        matchCancelled,
        isConnected: socket.connected,
    };
}

