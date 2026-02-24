import { Server, Socket } from "socket.io";
import { eventBus, EVENTS } from "../../utils/event-bus";

// We only need to initialize the event bus listeners once per server,
// not per socket connection.
let initialized = false;

export const initFriendSocketEvents = (io: Server) => {
  if (initialized) return;
  initialized = true;

  eventBus.on(EVENTS.FRIEND_REQUEST_SENT, (payload) => {
    io.to(`user:${payload.targetUserId}`).emit("FRIEND_REQUEST_RECEIVED", payload.request);
  });

  eventBus.on(EVENTS.FRIEND_REQUEST_ACCEPTED, (payload) => {
    io.to(`user:${payload.requesterId}`).emit("FRIEND_REQUEST_ACCEPTED", payload.request);
  });

  eventBus.on(EVENTS.FRIEND_REMOVED, (payload) => {
    io.to(`user:${payload.targetUserId}`).emit("FRIEND_REMOVED", { friendshipId: payload.friendshipId });
  });
};

export const registerFriendHandlers = (socket: Socket) => {
  // Any direct socket-to-server events for friends would go here
  // np. odznaczanie powiadomień
};

