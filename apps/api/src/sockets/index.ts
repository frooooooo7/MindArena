import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import { socketAuthMiddleware } from "./middleware/auth.middleware";
import {
  registerArenaHandlers,
  registerGameHandlers,
  registerDuelHandlers,
} from "./handlers";
import {
  initFriendSocketEvents,
  registerFriendHandlers,
} from "./handlers/friend.handler";
import * as roomService from "../services/room.service";
import * as queueService from "../services/queue.service";
import * as presenceService from "../services/presence.service";
import * as duelService from "../services/duel.service";

export class SocketManager {
  private io: Server;

  constructor(server: HttpServer) {
    this.io = new Server(server, {
      cors: {
        origin:
          process.env.NODE_ENV === "production"
            ? process.env.FRONTEND_URL
            : true,
        credentials: true,
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
    duelService.startCleanup(this.io);
    initFriendSocketEvents(this.io);

    // Apply authentication middleware

    this.io.use(socketAuthMiddleware);

    console.log("[SOCKET] Server initialized and waiting for connections...");

    this.io.on("connection", (socket: Socket) => {
      const user = socket.data.user;
      console.log(`[SOCKET] User connected: ${user?.name || socket.id}`);

      if (user?.id) {
        socket.join(`user:${user.id}`);
        presenceService.userConnected(user.id, socket.id);
        presenceService.notifyFriendsOfStatusChange(this.io, user.id, true);
        presenceService.sendOnlineFriendsToUser(this.io, user.id);
      }

      // Register all handlers (pass io for room broadcasting)
      registerArenaHandlers(socket, this.io);
      registerGameHandlers(socket, this.io);
      registerDuelHandlers(socket, this.io);
      registerFriendHandlers(socket);

      socket.on("disconnect", (reason) => {
        console.log(
          `[SOCKET] User disconnected: ${user?.name || socket.id} (${reason})`,
        );
        if (user?.id) {
          presenceService.userDisconnected(user.id, socket.id);
          // Only notify friends if user has no more connections
          if (!presenceService.isUserOnline(user.id)) {
            presenceService.notifyFriendsOfStatusChange(
              this.io,
              user.id,
              false,
            );
            // Cancel pending duel invitations from disconnected user
            const cancelledInvites = duelService.removeInvitationsFromUser(
              user.id,
            );
            for (const inv of cancelledInvites) {
              this.io.to(`user:${inv.targetId}`).emit("duel:cancelled", {
                invitationId: inv.id,
                reason: "inviter_offline",
              });
            }
            // Also remove invites targeting the disconnected user
            const targetInvites = duelService.removeInvitationsToUser(user.id);
            for (const inv of targetInvites) {
              this.io.to(`user:${inv.inviterId}`).emit("duel:cancelled", {
                invitationId: inv.id,
                reason: "target_offline",
              });
            }
          }
        }
      });
    });
  }

  // Utility methods for broadcasting
  public getIO(): Server {
    return this.io;
  }

  public emitToRoom(room: string, event: string, data: unknown) {
    this.io.to(room).emit(event, data);
  }

  public emitToAll(event: string, data: unknown) {
    this.io.emit(event, data);
  }
}
