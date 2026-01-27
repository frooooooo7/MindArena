import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";

export class SocketManager {
    private io: Server;

    constructor(server: HttpServer) {
        this.io = new Server(server, {
            cors: {
                origin: true, // In production, replace with specific frontend URL
                credentials: true
            }
        });

        this.init();
    }

    private init() {
        console.log("Initializing Socket.io...");

        this.io.on("connection", (socket: Socket) => {
            console.log(`User connected: ${socket.id}`);

            socket.on("arena:join-queue", (data) => {
                console.log(`User ${socket.id} joined arena queue for ${data.gameType}`);
                // Matchmaking logic will go here
                
                // For now, simulate matching after 3 seconds
                setTimeout(() => {
                    socket.emit("arena:match-found", {
                        opponent: { name: "ShadowPlayer", rank: 1200 },
                        room: `room-${socket.id}`,
                        gameType: data.gameType
                    });
                }, 3000);
            });

            socket.on("disconnect", () => {
                console.log(`User disconnected: ${socket.id}`);
            });
        });
    }
}
