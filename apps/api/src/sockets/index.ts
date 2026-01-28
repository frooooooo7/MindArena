import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import { socketAuthMiddleware } from "./middleware/auth.middleware";
import { registerArenaHandlers, registerGameHandlers } from "./handlers";
import * as roomService from "../services/room.service";
import * as queueService from "../services/queue.service";



export class SocketManager {
    private io: Server;

    constructor(server: HttpServer) {
        this.io = new Server(server, {
            cors: {
                origin: process.env.NODE_ENV === "production" 
                    ? process.env.FRONTEND_URL 
                    : true,
                credentials: true
            },
            // Reconnection settings
            pingTimeout: 60000,
            pingInterval: 25000,
        });

        this.init();
    }

    private init() {
        // Start background services
        roomService.startRoomCleanup(this.io);
        queueService.startCleanup(this.io);

        // Apply authentication middleware

        this.io.use(socketAuthMiddleware);

        console.log("[SOCKET] Server initialized and waiting for connections...");

        this.io.on("connection", (socket: Socket) => {
            const user = socket.data.user;
            console.log(`[SOCKET] User connected: ${user?.name || socket.id}`);

            // Register all handlers (pass io for room broadcasting)
            registerArenaHandlers(socket, this.io);
            registerGameHandlers(socket, this.io);

            socket.on("disconnect", (reason) => {
                console.log(`[SOCKET] User disconnected: ${user?.name || socket.id} (${reason})`);
            });
        });
    }

    // Utility methods for broadcasting
    public getIO(): Server {
        return this.io;
    }

    public emitToRoom(room: string, event: string, data: any) {
        this.io.to(room).emit(event, data);
    }

    public emitToAll(event: string, data: any) {
        this.io.emit(event, data);
    }
}
