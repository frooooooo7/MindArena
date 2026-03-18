import { Socket, Server } from "socket.io";
import {
  DUEL_EVENTS,
  SendDuelInvitePayload,
  DuelAcceptPayload,
  DuelDeclinePayload,
} from "@mindarena/shared";
import * as duelService from "../../services/duel.service";
import * as presenceService from "../../services/presence.service";
import { friendService } from "../../services/friend.service";
import { userRepository } from "../../repositories/user.repository";
import * as sequenceMemory from "../../services/games/sequence-memory.service";
import * as chimpMemory from "../../services/games/chimp-memory.service";
import * as roomService from "../../services/room.service";
import { ARENA_EVENTS } from "@mindarena/shared";

/**
 * Duel Handler
 * Handles socket events for private duel invitations
 */
export function registerDuelHandlers(socket: Socket, io: Server) {
  const user = socket.data.user;
  if (!user?.id) return; // Duels require authenticated users

  const userId = user.id;

  // ==========================================
  // SEND DUEL INVITE
  // ==========================================
  socket.on(DUEL_EVENTS.SEND_INVITE, async (data: SendDuelInvitePayload) => {
    try {
      const { targetUserId, gameType, rated } = data;

      // Validate: can't challenge yourself
      if (targetUserId === userId) {
        socket.emit(DUEL_EVENTS.ERROR, {
          message: "Cannot challenge yourself",
        });
        return;
      }

      // Validate: must be friends
      const friends = await friendService.areFriends(userId, targetUserId);
      if (!friends) {
        socket.emit(DUEL_EVENTS.ERROR, {
          message: "You can only challenge friends",
        });
        return;
      }

      // Validate: target must be online
      if (!presenceService.isUserOnline(targetUserId)) {
        socket.emit(DUEL_EVENTS.ERROR, { message: "Player is offline" });
        return;
      }

      // Validate game type
      const normalizedType = gameType.toLowerCase();
      if (!["sequence", "chimp"].includes(normalizedType)) {
        socket.emit(DUEL_EVENTS.ERROR, { message: "Invalid game type" });
        return;
      }

      // Get inviter info for the invitation
      const inviter = await userRepository.findById(userId);
      if (!inviter) {
        socket.emit(DUEL_EVENTS.ERROR, { message: "User not found" });
        return;
      }

      // Create invitation
      const invitation = duelService.createInvitation(
        userId,
        inviter.name,
        inviter.avatarUrl ?? undefined,
        inviter.rankName,
        inviter.rankPoints,
        targetUserId,
        normalizedType,
        rated,
      );

      // Send confirmation to inviter
      socket.emit(DUEL_EVENTS.INVITE_SENT, invitation);

      // Send invitation to target
      io.to(`user:${targetUserId}`).emit(
        DUEL_EVENTS.INVITE_RECEIVED,
        invitation,
      );
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to send invite";
      socket.emit(DUEL_EVENTS.ERROR, { message });
    }
  });

  // ==========================================
  // ACCEPT DUEL INVITE
  // ==========================================
  socket.on(DUEL_EVENTS.ACCEPT, async (data: DuelAcceptPayload) => {
    try {
      const { invitationId } = data;

      const invitation = duelService.getInvitation(invitationId);
      if (!invitation) {
        socket.emit(DUEL_EVENTS.ERROR, {
          message: "Invitation not found or expired",
        });
        return;
      }

      // Only the target can accept
      if (invitation.targetId !== userId) {
        socket.emit(DUEL_EVENTS.ERROR, { message: "Not authorized" });
        return;
      }

      // Remove invitation
      duelService.removeInvitation(invitationId);

      // Get both players' socket IDs
      const inviterSocketIds = presenceService.getUserSocketIds(
        invitation.inviterId,
      );
      const accepterSocketIds = presenceService.getUserSocketIds(userId);

      if (inviterSocketIds.length === 0) {
        socket.emit(DUEL_EVENTS.ERROR, {
          message: "Challenger went offline",
        });
        return;
      }

      // Use first socket ID for each player (primary tab)
      const inviterSocketId = inviterSocketIds[0];
      const accepterSocketId =
        accepterSocketIds.length > 0 ? accepterSocketIds[0] : socket.id;

      // Get accepter info
      const accepter = await userRepository.findById(userId);
      if (!accepter) {
        socket.emit(DUEL_EVENTS.ERROR, { message: "User not found" });
        return;
      }

      // Create game room
      const roomId = `duel-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const player1 = {
        id: invitation.inviterId,
        name: invitation.inviterName,
        socketId: inviterSocketId,
      };
      const player2 = {
        id: userId,
        name: accepter.name,
        socketId: accepterSocketId,
      };

      const gameOptions = {
        rated: invitation.rated,
        matchType: "duel" as const,
      };

      const normalizedType = invitation.gameType.toLowerCase();
      if (normalizedType === "chimp") {
        chimpMemory.createGameRoom(roomId, player1, player2, gameOptions);
      } else {
        sequenceMemory.createGameRoom(roomId, player1, player2, gameOptions);
      }

      // Join both players to the socket room
      const inviterSockets = await io
        .in(`user:${invitation.inviterId}`)
        .fetchSockets();
      for (const s of inviterSockets) {
        if (s.id === inviterSocketId) {
          s.join(roomId);
          break;
        }
      }
      socket.join(roomId);

      // Get room data to send
      const room = roomService.getRoom(roomId);
      if (!room) {
        socket.emit(DUEL_EVENTS.ERROR, {
          message: "Failed to create game room",
        });
        return;
      }

      // Notify both players - same event as matchmaking uses
      // ArenaMatch requires: { opponent: { id, name, rank, avatar }, room, gameType }
      const gameTypeDisplay =
        normalizedType.charAt(0).toUpperCase() + normalizedType.slice(1);

      io.to(inviterSocketId).emit(ARENA_EVENTS.MATCH_FOUND, {
        room: roomId,
        gameType: gameTypeDisplay,
        opponent: {
          id: userId,
          name: accepter.name,
          rank: accepter.rankPoints,
          avatar: accepter.name.charAt(0).toUpperCase(),
        },
      });

      io.to(accepterSocketId).emit(ARENA_EVENTS.MATCH_FOUND, {
        room: roomId,
        gameType: gameTypeDisplay,
        opponent: {
          id: invitation.inviterId,
          name: invitation.inviterName,
          rank: invitation.inviterRankPoints,
          avatar: invitation.inviterName.charAt(0).toUpperCase(),
        },
      });

      // Broadcast live games update
      roomService.broadcastLiveGames(io);

      console.log(
        `[DUEL] Match created: ${invitation.inviterName} vs ${accepter.name} (${normalizedType}, ${invitation.rated ? "ranked" : "casual"})`,
      );
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to accept invite";
      socket.emit(DUEL_EVENTS.ERROR, { message });
    }
  });

  // ==========================================
  // DECLINE DUEL INVITE
  // ==========================================
  socket.on(DUEL_EVENTS.DECLINE, (data: DuelDeclinePayload) => {
    try {
      const { invitationId } = data;

      const invitation = duelService.getInvitation(invitationId);
      if (!invitation) return; // Already expired/removed, silently ignore

      // Only the target can decline
      if (invitation.targetId !== userId) {
        socket.emit(DUEL_EVENTS.ERROR, { message: "Not authorized" });
        return;
      }

      duelService.removeInvitation(invitationId);

      // Notify inviter that challenge was declined
      io.to(`user:${invitation.inviterId}`).emit(DUEL_EVENTS.DECLINE, {
        invitationId,
        declinedBy: userId,
      });

      console.log(
        `[DUEL] Invitation declined: ${userId} declined ${invitation.inviterName}'s invite`,
      );
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to decline invite";
      socket.emit(DUEL_EVENTS.ERROR, { message });
    }
  });
}
