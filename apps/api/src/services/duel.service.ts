import { Server } from "socket.io";
import { DuelInvitation, DUEL_EVENTS } from "@mindarena/shared";
import crypto from "crypto";

/**
 * Duel Service
 * Manages pending duel invitations with 5-minute TTL.
 * All state is in-memory (no DB persistence).
 */

// invitationId → DuelInvitation
const pendingInvitations: Map<string, DuelInvitation> = new Map();

const INVITATION_TTL_MS = 5 * 60 * 1000; // 5 minutes
const CLEANUP_INTERVAL_MS = 15 * 1000; // 15 seconds

let cleanupInterval: NodeJS.Timeout | null = null;

/**
 * Create a new duel invitation
 */
export function createInvitation(
  inviterId: string,
  inviterName: string,
  inviterAvatar: string | undefined,
  inviterRankName: string,
  inviterRankPoints: number,
  targetId: string,
  gameType: string,
  rated: boolean,
): DuelInvitation {
  // Check for duplicate (same inviter → same target)
  const existing = getInvitationByPlayers(inviterId, targetId);
  if (existing) {
    throw new Error("You already have a pending invitation to this player");
  }

  const now = new Date();
  const invitation: DuelInvitation = {
    id: crypto.randomUUID(),
    inviterId,
    inviterName,
    inviterAvatar,
    inviterRankName,
    inviterRankPoints,
    targetId,
    gameType,
    rated,
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + INVITATION_TTL_MS).toISOString(),
  };

  pendingInvitations.set(invitation.id, invitation);
  console.log(
    `[DUEL] Invitation created: ${inviterName} → target ${targetId} (${gameType}, ${rated ? "ranked" : "casual"})`,
  );

  return invitation;
}

/**
 * Get an invitation by ID
 */
export function getInvitation(
  invitationId: string,
): DuelInvitation | undefined {
  const invitation = pendingInvitations.get(invitationId);
  if (!invitation) return undefined;

  // Check if expired
  if (new Date(invitation.expiresAt) <= new Date()) {
    pendingInvitations.delete(invitationId);
    return undefined;
  }

  return invitation;
}

/**
 * Remove an invitation
 */
export function removeInvitation(invitationId: string): void {
  pendingInvitations.delete(invitationId);
}

/**
 * Find a pending invitation between two players
 */
export function getInvitationByPlayers(
  inviterId: string,
  targetId: string,
): DuelInvitation | undefined {
  for (const invitation of pendingInvitations.values()) {
    if (
      invitation.inviterId === inviterId &&
      invitation.targetId === targetId
    ) {
      // Check expiry
      if (new Date(invitation.expiresAt) <= new Date()) {
        pendingInvitations.delete(invitation.id);
        return undefined;
      }
      return invitation;
    }
  }
  return undefined;
}

/**
 * Remove all invitations where a user is the inviter (e.g., on disconnect)
 */
export function removeInvitationsFromUser(userId: string): DuelInvitation[] {
  const removed: DuelInvitation[] = [];
  for (const [id, invitation] of pendingInvitations) {
    if (invitation.inviterId === userId) {
      pendingInvitations.delete(id);
      removed.push(invitation);
    }
  }
  return removed;
}

/**
 * Remove all invitations targeting a user (e.g., on disconnect)
 */
export function removeInvitationsToUser(userId: string): DuelInvitation[] {
  const removed: DuelInvitation[] = [];
  for (const [id, invitation] of pendingInvitations) {
    if (invitation.targetId === userId) {
      pendingInvitations.delete(id);
      removed.push(invitation);
    }
  }
  return removed;
}

/**
 * Start periodic cleanup of expired invitations.
 * Emits DUEL_EVENTS.EXPIRED to both parties when an invitation times out.
 */
export function startCleanup(io: Server): void {
  if (cleanupInterval) return;

  cleanupInterval = setInterval(() => {
    const now = new Date();
    let expiredCount = 0;

    for (const [id, invitation] of pendingInvitations) {
      if (new Date(invitation.expiresAt) <= now) {
        pendingInvitations.delete(id);
        expiredCount++;

        // Notify both parties
        const expiredPayload = {
          invitationId: id,
          reason: "expired",
        };

        io.to(`user:${invitation.inviterId}`).emit(
          DUEL_EVENTS.EXPIRED,
          expiredPayload,
        );
        io.to(`user:${invitation.targetId}`).emit(
          DUEL_EVENTS.EXPIRED,
          expiredPayload,
        );

        console.log(
          `[DUEL] Invitation expired: ${invitation.inviterName} → ${invitation.targetId}`,
        );
      }
    }

    if (expiredCount > 0) {
      console.log(
        `[DUEL] Cleanup: ${expiredCount} expired, ${pendingInvitations.size} remaining`,
      );
    }
  }, CLEANUP_INTERVAL_MS);

  console.log("[DUEL] Cleanup timer started with 15s interval");
}
