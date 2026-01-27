import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const socket: Socket = io(SOCKET_URL, {
    withCredentials: true,
    autoConnect: false,
    // Reconnection settings
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    // Timeouts
    timeout: 20000,
});

export const connectSocket = (accessToken: string) => {
    if (socket.connected) {
        console.log("[Socket] Already connected");
        return;
    }
    
    socket.auth = { token: accessToken };
    socket.connect();
};

export const disconnectSocket = () => {
    if (socket.connected) {
        socket.disconnect();
    }
};

export const isSocketConnected = (): boolean => {
    return socket.connected;
};
