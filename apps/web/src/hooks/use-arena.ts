import { useEffect, useCallback } from "react";
import { socket, connectSocket } from "@/lib/socket";
import { useAuthStore } from "@/store/auth.store";
import { useArenaStore } from "@/store/arena.store";
import { ArenaMatch, ARENA_EVENTS } from "@mindarena/shared";

export function useArena() {
    const { accessToken, isAuthenticated } = useAuthStore();
    const { isSearching, match, setSearching, setMatch, resetArena } = useArenaStore();

    useEffect(() => {
        if (isAuthenticated && accessToken && !socket.connected) {
            console.log("[useArena] Connecting to socket...");
            connectSocket(accessToken);
        }

        const handleMatchFound = (data: ArenaMatch) => {
            console.log("[useArena] Match found:", data);
            setMatch(data);
        };

        const handleQueueStatus = (data: { position: number; estimatedWait: string }) => {
            console.log("[useArena] Queue status:", data);
        };

        const handleConnect = () => console.log("[useArena] Socket connected!");
        const handleDisconnect = (reason: string) => {
            console.log("[useArena] Socket disconnected:", reason);
            // If disconnected while searching, reset state
            if (isSearching) {
                resetArena();
            }
        };
        const handleError = (err: Error) => {
            console.error("[useArena] Socket error:", err.message);
        };

        socket.on("connect", handleConnect);
        socket.on("disconnect", handleDisconnect);
        socket.on("connect_error", handleError);
        socket.on(ARENA_EVENTS.MATCH_FOUND, handleMatchFound);
        socket.on(ARENA_EVENTS.QUEUE_STATUS, handleQueueStatus);

        return () => {
            socket.off("connect", handleConnect);
            socket.off("disconnect", handleDisconnect);
            socket.off("connect_error", handleError);
            socket.off(ARENA_EVENTS.MATCH_FOUND, handleMatchFound);
            socket.off(ARENA_EVENTS.QUEUE_STATUS, handleQueueStatus);
        };
    }, [isAuthenticated, accessToken, setMatch, isSearching, resetArena]);

    const joinQueue = useCallback((gameType: string) => {
        if (!socket.connected) {
            console.error("[useArena] Cannot join queue - socket not connected");
            return;
        }
        console.log(`[useArena] Joining queue for: ${gameType}`);
        setSearching(true, gameType);
        socket.emit(ARENA_EVENTS.JOIN_QUEUE, { gameType });
    }, [setSearching]);

    const leaveQueue = useCallback(() => {
        console.log("[useArena] Leaving queue");
        // Notify server that user is leaving the queue
        if (socket.connected) {
            socket.emit(ARENA_EVENTS.LEAVE_QUEUE);
        }
        resetArena();
    }, [resetArena]);

    return {
        isSearching,
        match,
        joinQueue,
        leaveQueue,
    };
}
