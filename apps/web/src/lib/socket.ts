import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const socket: Socket = io(SOCKET_URL, {
    withCredentials: true,
    autoConnect: false, // Don't connect immediately
});

export const connectSocket = (accessToken: string) => {
    socket.auth = { token: accessToken };
    socket.connect();
};

export const disconnectSocket = () => {
    socket.disconnect();
};
