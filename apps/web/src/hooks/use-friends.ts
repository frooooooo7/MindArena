import { useState, useCallback, useEffect } from "react";
import { api } from "@/lib/axios";
import { socket } from "@/lib/socket";
import type { FriendshipDTO, SearchPlayersResponse } from "@mindarena/shared";
import { useAuthStore } from "@/store/auth.store";
import { FRIEND_ACTION_EVENT } from "@/components/friend-request-listener";

export const useFriends = () => {
    const { user } = useAuthStore();
    const [friends, setFriends] = useState<FriendshipDTO[]>([]);
    const [pendingRequests, setPendingRequests] = useState<{ received: FriendshipDTO[], sent: FriendshipDTO[] }>({ received: [], sent: [] });
    const [searchResults, setSearchResults] = useState<SearchPlayersResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadFriends = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await api.get("/friends");
            setFriends(data ?? []);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to load friends");
        } finally {
            setLoading(false);
        }
    }, []);

    const loadRequests = useCallback(async () => {
        try {
            const { data } = await api.get("/friends/requests");
            setPendingRequests(data);
        } catch (err: unknown) {
            console.error("Failed to load requests", err);
        }
    }, []);

    const searchUsers = useCallback(async (query: string, page = 1) => {
        if (!query || query.length < 3) return setSearchResults(null);
        try {
            setLoading(true);
            const { data } = await api.get("/friends/search", { params: { query, page } });
            setSearchResults(data);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Search failed");
        } finally {
            setLoading(false);
        }
    }, []);

    const sendRequest = async (targetUserId: string) => {
        try {
            const { data } = await api.post("/friends/requests", { targetUserId });
            setPendingRequests(prev => ({ ...prev, sent: [data, ...prev.sent] }));
            return true;
        } catch (err: unknown) {
            console.error("Failed to send request", err);
            return false;
        }
    };

    const acceptRequest = async (requestId: string) => {
        try {
            const { data } = await api.put(`/friends/requests/${requestId}/accept`);
            setPendingRequests(prev => ({
                ...prev,
                received: prev.received.filter(r => r.id !== requestId)
            }));
            setFriends(prev => [data, ...prev]);
            return true;
        } catch (err: unknown) {
            console.error("Failed to accept request", err);
            return false;
        }
    };

    const deleteRequestOrFriend = async (id: string) => {
        try {
            await api.delete(`/friends/requests/${id}`);
            setPendingRequests(prev => ({
                received: prev.received.filter(r => r.id !== id),
                sent: prev.sent.filter(s => s.id !== id)
            }));
            setFriends(prev => prev.filter(f => f.id !== id));
            return true;
        } catch (err: unknown) {
            console.error("Failed to delete", err);
            return false;
        }
    };

    // Socket listeners for real-time updates
    useEffect(() => {
        // Load initial data
        if (user) {
            loadFriends();
            loadRequests();
        }

        const handleRequestReceived = (request: FriendshipDTO) => {
            setPendingRequests(prev => ({
                ...prev,
                received: [request, ...prev.received]
            }));
        };

        const handleRequestAccepted = (request: FriendshipDTO) => {
            setPendingRequests(prev => ({
                ...prev,
                sent: prev.sent.filter(r => r.id !== request.id)
            }));
            setFriends(prev => [request, ...prev]);
        };

        const handleFriendRemoved = (payload: { friendshipId: string }) => {
            setFriends(prev => prev.filter(f => f.id !== payload.friendshipId));
            setPendingRequests(prev => ({
                received: prev.received.filter(r => r.id !== payload.friendshipId),
                sent: prev.sent.filter(s => s.id !== payload.friendshipId),
            }));
        };

        // Sync state when the global popup accepts/rejects a request
        const handleFriendAction = () => {
            loadFriends();
            loadRequests();
        };

        socket.on("FRIEND_REQUEST_RECEIVED", handleRequestReceived);
        socket.on("FRIEND_REQUEST_ACCEPTED", handleRequestAccepted);
        socket.on("FRIEND_REMOVED", handleFriendRemoved);
        window.addEventListener(FRIEND_ACTION_EVENT, handleFriendAction);

        return () => {
            socket.off("FRIEND_REQUEST_RECEIVED", handleRequestReceived);
            socket.off("FRIEND_REQUEST_ACCEPTED", handleRequestAccepted);
            socket.off("FRIEND_REMOVED", handleFriendRemoved);
            window.removeEventListener(FRIEND_ACTION_EVENT, handleFriendAction);
        };
    }, [user, loadFriends, loadRequests]);

    return {
        friends,
        pendingRequests,
        searchResults,
        loading,
        error,
        searchUsers,
        sendRequest,
        acceptRequest,
        deleteRequestOrFriend,
        loadFriends,
        loadRequests
    };
};
