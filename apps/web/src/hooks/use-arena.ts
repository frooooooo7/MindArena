import { useEffect, useState } from "react";
import { socket, connectSocket } from "@/lib/socket";
import { useAuthStore } from "@/store/auth.store";

export function useArena() {
    const { accessToken, isAuthenticated } = useAuthStore();
    const [isSearching, setIsSearching] = useState(false);
    const [match, setMatch] = useState<any>(null);

    useEffect(() => {
        if (isAuthenticated && accessToken) {
            connectSocket(accessToken);
        }

        socket.on("arena:match-found", (data) => {
            console.log("Match found!", data);
            setIsSearching(false);
            setMatch(data);
        });

        return () => {
            socket.off("arena:match-found");
        };
    }, [isAuthenticated, accessToken]);

    const joinQueue = (gameType: string) => {
        setIsSearching(true);
        setMatch(null);
        socket.emit("arena:join-queue", { gameType });
    };

    return {
        isSearching,
        match,
        joinQueue,
    };
}
