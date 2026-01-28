import { io, Socket } from "socket.io-client";
import { api } from "./axios";
import { useAuthStore } from "@/store/auth.store";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Create socket instance (lazy - doesn't connect yet)
export const socket: Socket = io(SOCKET_URL, {
    withCredentials: true,
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
});

// Flag to prevent multiple refresh attempts
let isRefreshing = false;

/**
 * Handle token refresh and reconnection
 */
async function handleTokenRefresh(): Promise<boolean> {
    if (isRefreshing) return false;
    isRefreshing = true;
    
    try {
        console.log("[Socket] Attempting token refresh...");
        
        // Call refresh endpoint
        const response = await api.post("/auth/refresh");
        const { accessToken, user } = response.data;
        
        // Update store
        useAuthStore.getState().setAuth(user, accessToken);
        
        console.log("[Socket] Token refreshed successfully");
        
        // Update socket auth and reconnect
        socket.auth = { token: accessToken };
        socket.connect();
        
        isRefreshing = false;
        return true;
    } catch (error) {
        console.error("[Socket] Token refresh failed:", error);
        isRefreshing = false;
        
        // Clear auth
        useAuthStore.getState().clearAuth();
        
        return false;
    }
}

// Handle connection errors
socket.on("connect_error", async (error) => {
    console.log("[Socket] Connection error:", error.message);
    
    // If token expired, try to refresh and reconnect
    if (error.message === "Token expired" || error.message.includes("expired")) {
        const refreshed = await handleTokenRefresh();
        if (!refreshed) {
            console.log("[Socket] Could not refresh token, redirecting to login...");
            // Optionally redirect to login
            if (typeof window !== "undefined" && window.location.pathname !== "/login") {
                window.location.href = "/login";
            }
        }
    }
});

/**
 * Connect socket with access token
 */
export function connectSocket(accessToken: string): void {
    if (socket.connected) {
        console.log("[Socket] Already connected");
        return;
    }
    
    socket.auth = { token: accessToken };
    socket.connect();
}

/**
 * Disconnect socket
 */
export function disconnectSocket(): void {
    if (socket.connected) {
        socket.disconnect();
    }
}

/**
 * Check if socket is connected
 */
export function isSocketConnected(): boolean {
    return socket.connected;
}

/**
 * Reconnect socket with fresh token from store
 */
export function reconnectSocket(): void {
    const accessToken = useAuthStore.getState().accessToken;
    if (accessToken) {
        socket.auth = { token: accessToken };
        socket.connect();
    }
}
