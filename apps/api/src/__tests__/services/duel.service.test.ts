/**
 * Duel Service Tests
 * Tests for in-memory duel invitation management:
 * create, get, remove, cleanup, TTL expiry, and duplicate prevention
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { DUEL_EVENTS } from "@mindarena/shared";

// We need to re-import the module freshly for each test to reset state
// Since pendingInvitations Map is module-scoped, we isolate via vi.resetModules()
let duelService: typeof import("../../services/duel.service");

// ==========================================
// HELPERS
// ==========================================

function createTestInvitation(
  overrides: Partial<{
    inviterId: string;
    inviterName: string;
    inviterAvatar: string | undefined;
    inviterRankName: string;
    inviterRankPoints: number;
    targetId: string;
    gameType: string;
    rated: boolean;
  }> = {},
) {
  return duelService.createInvitation(
    overrides.inviterId ?? "inviter-1",
    overrides.inviterName ?? "Inviter",
    overrides.inviterAvatar ?? "avatar-url",
    overrides.inviterRankName ?? "Neuron",
    overrides.inviterRankPoints ?? 100,
    overrides.targetId ?? "target-1",
    overrides.gameType ?? "sequence",
    overrides.rated ?? true,
  );
}

// ==========================================
// TESTS
// ==========================================

describe("Duel Service", () => {
  beforeEach(async () => {
    vi.resetModules();
    vi.useFakeTimers();
    duelService = await import("../../services/duel.service");
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  // ==========================================
  // createInvitation
  // ==========================================
  describe("createInvitation", () => {
    it("should create an invitation with all fields set correctly", () => {
      const invitation = createTestInvitation({
        inviterId: "user-a",
        inviterName: "Alice",
        inviterAvatar: "alice-avatar.png",
        inviterRankName: "Synapsa",
        inviterRankPoints: 200,
        targetId: "user-b",
        gameType: "chimp",
        rated: false,
      });

      expect(invitation.id).toBeDefined();
      expect(invitation.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );
      expect(invitation.inviterId).toBe("user-a");
      expect(invitation.inviterName).toBe("Alice");
      expect(invitation.inviterAvatar).toBe("alice-avatar.png");
      expect(invitation.inviterRankName).toBe("Synapsa");
      expect(invitation.inviterRankPoints).toBe(200);
      expect(invitation.targetId).toBe("user-b");
      expect(invitation.gameType).toBe("chimp");
      expect(invitation.rated).toBe(false);
      expect(invitation.createdAt).toBeDefined();
      expect(invitation.expiresAt).toBeDefined();
    });

    it("should set expiresAt to 5 minutes after creation", () => {
      const now = new Date("2026-02-28T12:00:00.000Z");
      vi.setSystemTime(now);

      const invitation = createTestInvitation();

      const expiresAt = new Date(invitation.expiresAt);
      const createdAt = new Date(invitation.createdAt);
      const diffMs = expiresAt.getTime() - createdAt.getTime();

      expect(diffMs).toBe(5 * 60 * 1000); // 5 minutes
    });

    it("should handle undefined avatar", () => {
      const invitation = duelService.createInvitation(
        "inviter-1",
        "Inviter",
        undefined,
        "Neuron",
        100,
        "target-1",
        "sequence",
        true,
      );
      expect(invitation.inviterAvatar).toBeUndefined();
    });

    it("should generate unique IDs for each invitation", () => {
      const inv1 = createTestInvitation({ targetId: "target-1" });
      const inv2 = createTestInvitation({ targetId: "target-2" });

      expect(inv1.id).not.toBe(inv2.id);
    });

    it("should throw if duplicate invitation exists (same inviter → same target)", () => {
      createTestInvitation({ inviterId: "user-a", targetId: "user-b" });

      expect(() =>
        createTestInvitation({ inviterId: "user-a", targetId: "user-b" }),
      ).toThrow("You already have a pending invitation to this player");
    });

    it("should allow same inviter to invite different targets", () => {
      const inv1 = createTestInvitation({
        inviterId: "user-a",
        targetId: "user-b",
      });
      const inv2 = createTestInvitation({
        inviterId: "user-a",
        targetId: "user-c",
      });

      expect(inv1.targetId).toBe("user-b");
      expect(inv2.targetId).toBe("user-c");
    });

    it("should allow different inviters to invite the same target", () => {
      const inv1 = createTestInvitation({
        inviterId: "user-a",
        targetId: "user-c",
      });
      const inv2 = createTestInvitation({
        inviterId: "user-b",
        targetId: "user-c",
      });

      expect(inv1.inviterId).toBe("user-a");
      expect(inv2.inviterId).toBe("user-b");
    });

    it("should allow reverse direction invitation (target invites inviter)", () => {
      const inv1 = createTestInvitation({
        inviterId: "user-a",
        targetId: "user-b",
      });
      const inv2 = createTestInvitation({
        inviterId: "user-b",
        targetId: "user-a",
      });

      expect(inv1.inviterId).toBe("user-a");
      expect(inv2.inviterId).toBe("user-b");
    });
  });

  // ==========================================
  // getInvitation
  // ==========================================
  describe("getInvitation", () => {
    it("should return an existing invitation by ID", () => {
      const created = createTestInvitation();

      const retrieved = duelService.getInvitation(created.id);

      expect(retrieved).toBeDefined();
      expect(retrieved!.id).toBe(created.id);
      expect(retrieved!.inviterId).toBe("inviter-1");
    });

    it("should return undefined for non-existent ID", () => {
      const result = duelService.getInvitation("nonexistent-id");
      expect(result).toBeUndefined();
    });

    it("should return undefined for expired invitation and remove it", () => {
      const now = new Date("2026-02-28T12:00:00.000Z");
      vi.setSystemTime(now);

      const invitation = createTestInvitation();

      // Fast-forward past TTL (5 min + 1 ms)
      vi.setSystemTime(new Date(now.getTime() + 5 * 60 * 1000 + 1));

      const result = duelService.getInvitation(invitation.id);
      expect(result).toBeUndefined();

      // Should have been cleaned up - trying again still returns undefined
      const result2 = duelService.getInvitation(invitation.id);
      expect(result2).toBeUndefined();
    });

    it("should return invitation if not yet expired", () => {
      const now = new Date("2026-02-28T12:00:00.000Z");
      vi.setSystemTime(now);

      const invitation = createTestInvitation();

      // Fast-forward to just before TTL (4 min 59 sec)
      vi.setSystemTime(new Date(now.getTime() + 4 * 60 * 1000 + 59 * 1000));

      const result = duelService.getInvitation(invitation.id);
      expect(result).toBeDefined();
      expect(result!.id).toBe(invitation.id);
    });
  });

  // ==========================================
  // removeInvitation
  // ==========================================
  describe("removeInvitation", () => {
    it("should remove an existing invitation", () => {
      const invitation = createTestInvitation();

      duelService.removeInvitation(invitation.id);

      expect(duelService.getInvitation(invitation.id)).toBeUndefined();
    });

    it("should not throw when removing non-existent invitation", () => {
      expect(() => duelService.removeInvitation("nonexistent")).not.toThrow();
    });

    it("should allow creating new invitation to same target after removal", () => {
      const inv1 = createTestInvitation({ inviterId: "a", targetId: "b" });
      duelService.removeInvitation(inv1.id);

      // Should not throw — duplicate check should pass
      const inv2 = createTestInvitation({ inviterId: "a", targetId: "b" });
      expect(inv2.id).not.toBe(inv1.id);
    });
  });

  // ==========================================
  // getInvitationByPlayers
  // ==========================================
  describe("getInvitationByPlayers", () => {
    it("should find invitation between specific inviter and target", () => {
      const created = createTestInvitation({ inviterId: "a", targetId: "b" });

      const found = duelService.getInvitationByPlayers("a", "b");

      expect(found).toBeDefined();
      expect(found!.id).toBe(created.id);
    });

    it("should NOT find invitation in reverse direction", () => {
      createTestInvitation({ inviterId: "a", targetId: "b" });

      const found = duelService.getInvitationByPlayers("b", "a");
      expect(found).toBeUndefined();
    });

    it("should return undefined when no invitation exists", () => {
      const result = duelService.getInvitationByPlayers("x", "y");
      expect(result).toBeUndefined();
    });

    it("should return undefined for expired invitation and clean it up", () => {
      const now = new Date("2026-02-28T12:00:00.000Z");
      vi.setSystemTime(now);

      createTestInvitation({ inviterId: "a", targetId: "b" });

      // Expire it
      vi.setSystemTime(new Date(now.getTime() + 5 * 60 * 1000 + 1));

      const result = duelService.getInvitationByPlayers("a", "b");
      expect(result).toBeUndefined();
    });

    it("should find correct invitation among many", () => {
      createTestInvitation({ inviterId: "a", targetId: "b" });
      const target = createTestInvitation({ inviterId: "c", targetId: "d" });
      createTestInvitation({ inviterId: "e", targetId: "f" });

      const found = duelService.getInvitationByPlayers("c", "d");
      expect(found).toBeDefined();
      expect(found!.id).toBe(target.id);
    });
  });

  // ==========================================
  // removeInvitationsFromUser
  // ==========================================
  describe("removeInvitationsFromUser", () => {
    it("should remove all invitations where user is the inviter", () => {
      const inv1 = createTestInvitation({ inviterId: "a", targetId: "b" });
      const inv2 = createTestInvitation({ inviterId: "a", targetId: "c" });
      createTestInvitation({ inviterId: "d", targetId: "a" }); // a is target, not inviter

      const removed = duelService.removeInvitationsFromUser("a");

      expect(removed).toHaveLength(2);
      expect(removed.map((r) => r.id).sort()).toEqual(
        [inv1.id, inv2.id].sort(),
      );

      // Verify they're actually removed
      expect(duelService.getInvitation(inv1.id)).toBeUndefined();
      expect(duelService.getInvitation(inv2.id)).toBeUndefined();
    });

    it("should NOT remove invitations where user is the target", () => {
      const inv = createTestInvitation({ inviterId: "d", targetId: "a" });

      const removed = duelService.removeInvitationsFromUser("a");

      expect(removed).toHaveLength(0);
      expect(duelService.getInvitation(inv.id)).toBeDefined();
    });

    it("should return empty array when no invitations from user", () => {
      const removed = duelService.removeInvitationsFromUser("nonexistent");
      expect(removed).toEqual([]);
    });
  });

  // ==========================================
  // removeInvitationsToUser
  // ==========================================
  describe("removeInvitationsToUser", () => {
    it("should remove all invitations targeting the user", () => {
      createTestInvitation({ inviterId: "a", targetId: "x" });
      const inv1 = createTestInvitation({ inviterId: "b", targetId: "x" });
      const inv2 = createTestInvitation({ inviterId: "c", targetId: "x" });

      // "a" also targets "x" but we already have it
      // Actually let's create a clean scenario
      duelService.removeInvitation(
        duelService.getInvitationByPlayers("a", "x")!.id,
      );

      const removed = duelService.removeInvitationsToUser("x");

      expect(removed).toHaveLength(2);
      expect(duelService.getInvitation(inv1.id)).toBeUndefined();
      expect(duelService.getInvitation(inv2.id)).toBeUndefined();
    });

    it("should NOT remove invitations sent by the user", () => {
      const inv = createTestInvitation({ inviterId: "x", targetId: "y" });

      const removed = duelService.removeInvitationsToUser("x");

      expect(removed).toHaveLength(0);
      expect(duelService.getInvitation(inv.id)).toBeDefined();
    });

    it("should return empty array when no invitations to user", () => {
      const removed = duelService.removeInvitationsToUser("nonexistent");
      expect(removed).toEqual([]);
    });
  });

  // ==========================================
  // startCleanup (periodic expiry)
  // ==========================================
  describe("startCleanup", () => {
    it("should emit EXPIRED event to both parties when invitation expires", () => {
      const mockEmit = vi.fn();
      const mockIo = {
        to: vi.fn(() => ({ emit: mockEmit })),
      } as unknown as import("socket.io").Server;

      const inv = createTestInvitation({
        inviterId: "user-a",
        targetId: "user-b",
      });

      duelService.startCleanup(mockIo);

      // Move time past invitation TTL
      vi.advanceTimersByTime(5 * 60 * 1000 + 1);

      // Trigger cleanup interval (15s)
      vi.advanceTimersByTime(15 * 1000);

      // Should have called io.to for both parties
      expect(mockIo.to).toHaveBeenCalledWith("user:user-a");
      expect(mockIo.to).toHaveBeenCalledWith("user:user-b");

      // Should emit EXPIRED event with correct payload
      expect(mockEmit).toHaveBeenCalledWith(DUEL_EVENTS.EXPIRED, {
        invitationId: inv.id,
        reason: "expired",
      });
    });

    it("should not emit for non-expired invitations", () => {
      const mockEmit = vi.fn();
      const mockIo = {
        to: vi.fn(() => ({ emit: mockEmit })),
      } as unknown as import("socket.io").Server;

      createTestInvitation();

      duelService.startCleanup(mockIo);

      // Run cleanup once (15s) but within TTL
      vi.advanceTimersByTime(15 * 1000);

      expect(mockEmit).not.toHaveBeenCalled();
    });

    it("should only start one cleanup interval (idempotent)", () => {
      const mockIo = {
        to: vi.fn(() => ({ emit: vi.fn() })),
      } as unknown as import("socket.io").Server;

      duelService.startCleanup(mockIo);
      duelService.startCleanup(mockIo); // second call should be no-op

      // If it started two intervals, we'd see double events
      const inv = createTestInvitation();
      vi.advanceTimersByTime(5 * 60 * 1000 + 15 * 1000 + 1);

      // Count how many times EXPIRED was emitted for this one invitation
      const expiredCalls = (
        mockIo.to as ReturnType<typeof vi.fn>
      ).mock.calls.filter(
        (c: unknown[]) => c[0] === `user:${inv.inviterId}`,
      ).length;

      // Should be 1, not 2 (not duplicated by a second interval)
      expect(expiredCalls).toBe(1);
    });

    it("should remove expired invitation from store after cleanup", () => {
      const mockIo = {
        to: vi.fn(() => ({ emit: vi.fn() })),
      } as unknown as import("socket.io").Server;

      const inv = createTestInvitation();
      duelService.startCleanup(mockIo);

      // Expire + run cleanup
      vi.advanceTimersByTime(5 * 60 * 1000 + 15 * 1000 + 1);

      expect(duelService.getInvitation(inv.id)).toBeUndefined();
    });

    it("should handle multiple expired invitations in one sweep", () => {
      const mockEmit = vi.fn();
      const mockIo = {
        to: vi.fn(() => ({ emit: mockEmit })),
      } as unknown as import("socket.io").Server;

      const inv1 = createTestInvitation({ inviterId: "a", targetId: "b" });
      const inv2 = createTestInvitation({ inviterId: "c", targetId: "d" });

      duelService.startCleanup(mockIo);

      // Expire all + run cleanup
      vi.advanceTimersByTime(5 * 60 * 1000 + 15 * 1000 + 1);

      // 2 invitations × 2 parties each = 4 emit calls
      expect(mockEmit).toHaveBeenCalledTimes(4);

      expect(duelService.getInvitation(inv1.id)).toBeUndefined();
      expect(duelService.getInvitation(inv2.id)).toBeUndefined();
    });
  });
});
