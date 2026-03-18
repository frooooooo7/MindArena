import { Server } from "socket.io";
import { PRESENCE_EVENTS } from "@mindarena/shared";
import { friendRepository } from "../repositories/friend.repository";

/**
 * Presence Service
 * Tracks which users are currently online via Socket.IO connections.
 * Supports multi-tab (multiple socketIds per user).
 */

// userId → Set<socketId>
const onlineUsers: Map<string, Set<string>> = new Map();

/**
 * Register a user as connected
 */
export function userConnected(userId: string, socketId: string): void {
  let socketIds = onlineUsers.get(userId);
  if (!socketIds) {
    socketIds = new Set();
    onlineUsers.set(userId, socketIds);
  }
  socketIds.add(socketId);
  console.log(
    `[PRESENCE] ${userId} connected (socket: ${socketId}, tabs: ${socketIds.size})`,
  );
}

/**
 * Unregister a user's socket connection
 */
export function userDisconnected(userId: string, socketId: string): void {
  const socketIds = onlineUsers.get(userId);
  if (!socketIds) return;

  socketIds.delete(socketId);

  if (socketIds.size === 0) {
    onlineUsers.delete(userId);
    console.log(`[PRESENCE] ${userId} fully offline`);
  } else {
    console.log(
      `[PRESENCE] ${userId} disconnected tab (remaining: ${socketIds.size})`,
    );
  }
}

/**
 * Check if a user is online (has at least one active socket)
 */
export function isUserOnline(userId: string): boolean {
  const socketIds = onlineUsers.get(userId);
  return !!socketIds && socketIds.size > 0;
}

/**
 * Get all active socketIds for a user
 */
export function getUserSocketIds(userId: string): string[] {
  const socketIds = onlineUsers.get(userId);
  return socketIds ? Array.from(socketIds) : [];
}

/**
 * Get all online user IDs
 */
export function getOnlineUserIds(): string[] {
  return Array.from(onlineUsers.keys());
}

/**
 * Get online friend IDs for a given user.
 * Fetches accepted friendships from DB and filters by online status.
 */
export async function getOnlineFriendIds(userId: string): Promise<string[]> {
  try {
    const friends = await friendRepository.getFriendsForUser(userId);
    const friendIds = friends.map((f) =>
      f.requesterId === userId ? f.addresseeId : f.requesterId,
    );
    return friendIds.filter((id) => isUserOnline(id));
  } catch (error) {
    console.error("[PRESENCE] Failed to get online friends:", error);
    return [];
  }
}

/**
 * Notify a user's friends about their online/offline status change.
 * Called on connect (isOnline=true) and on full disconnect (isOnline=false).
 */
export async function notifyFriendsOfStatusChange(
  io: Server,
  userId: string,
  isOnline: boolean,
): Promise<void> {
  try {
    const friends = await friendRepository.getFriendsForUser(userId);
    const friendIds = friends.map((f) =>
      f.requesterId === userId ? f.addresseeId : f.requesterId,
    );

    const event = isOnline
      ? PRESENCE_EVENTS.FRIEND_ONLINE
      : PRESENCE_EVENTS.FRIEND_OFFLINE;

    for (const friendId of friendIds) {
      if (isUserOnline(friendId)) {
        io.to(`user:${friendId}`).emit(event, { friendId: userId });
      }
    }
  } catch (error) {
    console.error("[PRESENCE] Failed to notify friends:", error);
  }
}

/**
 * Send the initial list of online friends to a newly connected user.
 */
export async function sendOnlineFriendsToUser(
  io: Server,
  userId: string,
): Promise<void> {
  try {
    const onlineFriendIds = await getOnlineFriendIds(userId);
    io.to(`user:${userId}`).emit(PRESENCE_EVENTS.FRIENDS_ONLINE, {
      friendIds: onlineFriendIds,
    });
  } catch (error) {
    console.error("[PRESENCE] Failed to send online friends:", error);
  }
}
