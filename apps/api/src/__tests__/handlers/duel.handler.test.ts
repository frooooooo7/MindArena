/**
 * Duel Handler Tests
 * Integration tests for duel socket events: send-invite, accept, decline
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { DUEL_EVENTS, ARENA_EVENTS } from "@mindarena/shared";
import {
  createMockSocket,
  createMockServer,
  type MockSocket,
  type MockServer,
} from "../test-utils";

// ==========================================
// MOCKS
// ==========================================

vi.mock("../../services/duel.service", () => ({
  createInvitation: vi.fn(),
  getInvitation: vi.fn(),
  removeInvitation: vi.fn(),
  getInvitationByPlayers: vi.fn(),
  removeInvitationsFromUser: vi.fn(),
  removeInvitationsToUser: vi.fn(),
  startCleanup: vi.fn(),
}));

vi.mock("../../services/presence.service", () => ({
  isUserOnline: vi.fn(),
  getUserSocketIds: vi.fn(),
}));

vi.mock("../../services/friend.service", () => ({
  friendService: {
    areFriends: vi.fn(),
  },
}));

vi.mock("../../repositories/user.repository", () => ({
  userRepository: {
    findById: vi.fn(),
  },
}));

vi.mock("../../services/games/sequence-memory.service", () => ({
  createGameRoom: vi.fn(),
}));

vi.mock("../../services/games/chimp-memory.service", () => ({
  createGameRoom: vi.fn(),
}));

vi.mock("../../services/room.service", () => ({
  getRoom: vi.fn(),
  broadcastLiveGames: vi.fn(),
}));

// Import after mocks
import { registerDuelHandlers } from "../../sockets/handlers/duel.handler";
import * as duelService from "../../services/duel.service";
import * as presenceService from "../../services/presence.service";
import { friendService } from "../../services/friend.service";
import { userRepository } from "../../repositories/user.repository";
import * as sequenceMemory from "../../services/games/sequence-memory.service";
import * as chimpMemory from "../../services/games/chimp-memory.service";
import * as roomService from "../../services/room.service";

// Type-safe mocks
const mockCreateInvitation = vi.mocked(duelService.createInvitation);
const mockGetInvitation = vi.mocked(duelService.getInvitation);
const mockRemoveInvitation = vi.mocked(duelService.removeInvitation);
const mockIsUserOnline = vi.mocked(presenceService.isUserOnline);
const mockGetUserSocketIds = vi.mocked(presenceService.getUserSocketIds);
const mockAreFriends = vi.mocked(friendService.areFriends);
const mockFindById = vi.mocked(userRepository.findById);
const mockSequenceCreateRoom = vi.mocked(sequenceMemory.createGameRoom);
const mockChimpCreateRoom = vi.mocked(chimpMemory.createGameRoom);
const mockGetRoom = vi.mocked(roomService.getRoom);
const mockBroadcastLiveGames = vi.mocked(roomService.broadcastLiveGames);

// ==========================================
// HELPERS
// ==========================================

function createMockUser(
  id: string,
  name: string,
  overrides: Record<string, unknown> = {},
) {
  return {
    id,
    name,
    avatarUrl: null,
    rankName: "Neuron",
    rankPoints: 50,
    ...overrides,
  };
}

function createMockInvitation(overrides: Record<string, unknown> = {}) {
  return {
    id: "inv-1",
    inviterId: "user-1",
    inviterName: "Player 1",
    inviterAvatar: undefined,
    inviterRankName: "Neuron",
    inviterRankPoints: 50,
    targetId: "user-2",
    gameType: "sequence",
    rated: true,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    ...overrides,
  };
}

// ==========================================
// TESTS
// ==========================================

describe("Duel Handler", () => {
  let mockSocket: MockSocket;
  let mockServer: MockServer;
  let eventHandlers: Map<string, Function>;

  beforeEach(() => {
    vi.clearAllMocks();

    // Create socket for user-1
    mockSocket = createMockSocket("socket-1", "user-1", "Player 1");
    eventHandlers = new Map();
    mockSocket.on = vi.fn((event: string, handler: Function) => {
      eventHandlers.set(event, handler);
    });

    mockServer = createMockServer([mockSocket]);

    // Register handlers
    registerDuelHandlers(
      mockSocket as unknown as import("socket.io").Socket,
      mockServer as unknown as import("socket.io").Server,
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ==========================================
  // Handler Registration
  // ==========================================
  describe("handler registration", () => {
    it("should register SEND_INVITE handler", () => {
      expect(eventHandlers.has(DUEL_EVENTS.SEND_INVITE)).toBe(true);
    });

    it("should register ACCEPT handler", () => {
      expect(eventHandlers.has(DUEL_EVENTS.ACCEPT)).toBe(true);
    });

    it("should register DECLINE handler", () => {
      expect(eventHandlers.has(DUEL_EVENTS.DECLINE)).toBe(true);
    });

    it("should not register handlers for unauthenticated socket", () => {
      const unauthSocket = createMockSocket("socket-x");
      const handlers = new Map<string, Function>();
      unauthSocket.on = vi.fn((event: string, handler: Function) => {
        handlers.set(event, handler);
      });

      registerDuelHandlers(
        unauthSocket as unknown as import("socket.io").Socket,
        mockServer as unknown as import("socket.io").Server,
      );

      expect(handlers.size).toBe(0);
    });
  });

  // ==========================================
  // SEND_INVITE
  // ==========================================
  describe("SEND_INVITE event", () => {
    it("should emit error when challenging yourself", async () => {
      const handler = eventHandlers.get(DUEL_EVENTS.SEND_INVITE)!;

      await handler({
        targetUserId: "user-1", // same as socket user
        gameType: "sequence",
        rated: true,
      });

      expect(mockSocket.emit).toHaveBeenCalledWith(DUEL_EVENTS.ERROR, {
        message: "Cannot challenge yourself",
      });
      expect(mockCreateInvitation).not.toHaveBeenCalled();
    });

    it("should emit error when not friends", async () => {
      const handler = eventHandlers.get(DUEL_EVENTS.SEND_INVITE)!;
      mockAreFriends.mockResolvedValueOnce(false);

      await handler({
        targetUserId: "user-2",
        gameType: "sequence",
        rated: true,
      });

      expect(mockAreFriends).toHaveBeenCalledWith("user-1", "user-2");
      expect(mockSocket.emit).toHaveBeenCalledWith(DUEL_EVENTS.ERROR, {
        message: "You can only challenge friends",
      });
      expect(mockCreateInvitation).not.toHaveBeenCalled();
    });

    it("should emit error when target is offline", async () => {
      const handler = eventHandlers.get(DUEL_EVENTS.SEND_INVITE)!;
      mockAreFriends.mockResolvedValueOnce(true);
      mockIsUserOnline.mockReturnValueOnce(false);

      await handler({
        targetUserId: "user-2",
        gameType: "sequence",
        rated: true,
      });

      expect(mockIsUserOnline).toHaveBeenCalledWith("user-2");
      expect(mockSocket.emit).toHaveBeenCalledWith(DUEL_EVENTS.ERROR, {
        message: "Player is offline",
      });
    });

    it("should emit error for invalid game type", async () => {
      const handler = eventHandlers.get(DUEL_EVENTS.SEND_INVITE)!;
      mockAreFriends.mockResolvedValueOnce(true);
      mockIsUserOnline.mockReturnValueOnce(true);

      await handler({
        targetUserId: "user-2",
        gameType: "invalid-game",
        rated: true,
      });

      expect(mockSocket.emit).toHaveBeenCalledWith(DUEL_EVENTS.ERROR, {
        message: "Invalid game type",
      });
    });

    it("should emit error if inviter user not found in DB", async () => {
      const handler = eventHandlers.get(DUEL_EVENTS.SEND_INVITE)!;
      mockAreFriends.mockResolvedValueOnce(true);
      mockIsUserOnline.mockReturnValueOnce(true);
      mockFindById.mockResolvedValueOnce(null);

      await handler({
        targetUserId: "user-2",
        gameType: "sequence",
        rated: true,
      });

      expect(mockFindById).toHaveBeenCalledWith("user-1");
      expect(mockSocket.emit).toHaveBeenCalledWith(DUEL_EVENTS.ERROR, {
        message: "User not found",
      });
    });

    it("should create invitation and emit to both parties on success", async () => {
      const handler = eventHandlers.get(DUEL_EVENTS.SEND_INVITE)!;
      const mockInvitation = createMockInvitation();

      mockAreFriends.mockResolvedValueOnce(true);
      mockIsUserOnline.mockReturnValueOnce(true);
      mockFindById.mockResolvedValueOnce(
        createMockUser("user-1", "Player 1", {
          avatarUrl: "avatar.png",
        }) as any,
      );
      mockCreateInvitation.mockReturnValueOnce(mockInvitation as any);

      await handler({
        targetUserId: "user-2",
        gameType: "sequence",
        rated: true,
      });

      // Should create invitation with correct params
      expect(mockCreateInvitation).toHaveBeenCalledWith(
        "user-1",
        "Player 1",
        "avatar.png",
        "Neuron",
        50,
        "user-2",
        "sequence",
        true,
      );

      // Should emit INVITE_SENT to inviter
      expect(mockSocket.emit).toHaveBeenCalledWith(
        DUEL_EVENTS.INVITE_SENT,
        mockInvitation,
      );

      // Should emit INVITE_RECEIVED to target via io.to
      expect(mockServer.to).toHaveBeenCalledWith("user:user-2");
    });

    it("should normalize game type to lowercase", async () => {
      const handler = eventHandlers.get(DUEL_EVENTS.SEND_INVITE)!;
      const mockInvitation = createMockInvitation();

      mockAreFriends.mockResolvedValueOnce(true);
      mockIsUserOnline.mockReturnValueOnce(true);
      mockFindById.mockResolvedValueOnce(
        createMockUser("user-1", "Player 1") as any,
      );
      mockCreateInvitation.mockReturnValueOnce(mockInvitation as any);

      await handler({
        targetUserId: "user-2",
        gameType: "SEQUENCE",
        rated: false,
      });

      // Verify the 7th arg (gameType) is lowercased
      const callArgs = mockCreateInvitation.mock.calls[0];
      expect(callArgs[6]).toBe("sequence"); // lowercased from "SEQUENCE"
      expect(callArgs[7]).toBe(false);
    });

    it("should accept chimp game type", async () => {
      const handler = eventHandlers.get(DUEL_EVENTS.SEND_INVITE)!;

      mockAreFriends.mockResolvedValueOnce(true);
      mockIsUserOnline.mockReturnValueOnce(true);
      mockFindById.mockResolvedValueOnce(
        createMockUser("user-1", "Player 1") as any,
      );
      mockCreateInvitation.mockReturnValueOnce(
        createMockInvitation({ gameType: "chimp" }) as any,
      );

      await handler({
        targetUserId: "user-2",
        gameType: "chimp",
        rated: true,
      });

      expect(mockCreateInvitation).toHaveBeenCalled();
      expect(mockSocket.emit).toHaveBeenCalledWith(
        DUEL_EVENTS.INVITE_SENT,
        expect.anything(),
      );
    });

    it("should emit error message from duelService exception", async () => {
      const handler = eventHandlers.get(DUEL_EVENTS.SEND_INVITE)!;

      mockAreFriends.mockResolvedValueOnce(true);
      mockIsUserOnline.mockReturnValueOnce(true);
      mockFindById.mockResolvedValueOnce(
        createMockUser("user-1", "Player 1") as any,
      );
      mockCreateInvitation.mockImplementationOnce(() => {
        throw new Error("You already have a pending invitation to this player");
      });

      await handler({
        targetUserId: "user-2",
        gameType: "sequence",
        rated: true,
      });

      expect(mockSocket.emit).toHaveBeenCalledWith(DUEL_EVENTS.ERROR, {
        message: "You already have a pending invitation to this player",
      });
    });

    it("should handle undefined avatarUrl by passing undefined", async () => {
      const handler = eventHandlers.get(DUEL_EVENTS.SEND_INVITE)!;

      mockAreFriends.mockResolvedValueOnce(true);
      mockIsUserOnline.mockReturnValueOnce(true);
      mockFindById.mockResolvedValueOnce(
        createMockUser("user-1", "Player 1", { avatarUrl: null }) as any,
      );
      mockCreateInvitation.mockReturnValueOnce(createMockInvitation() as any);

      await handler({
        targetUserId: "user-2",
        gameType: "sequence",
        rated: true,
      });

      // avatarUrl is null, so ?? undefined
      expect(mockCreateInvitation).toHaveBeenCalledWith(
        "user-1",
        "Player 1",
        undefined, // null converted to undefined via ??
        "Neuron",
        50,
        "user-2",
        "sequence",
        true,
      );
    });
  });

  // ==========================================
  // ACCEPT
  // ==========================================
  describe("ACCEPT event", () => {
    // For accept tests, socket user = user-2 (the target)
    let acceptSocket: MockSocket;
    let acceptEventHandlers: Map<string, Function>;

    beforeEach(() => {
      acceptSocket = createMockSocket("socket-2", "user-2", "Player 2");
      acceptEventHandlers = new Map();
      acceptSocket.on = vi.fn((event: string, handler: Function) => {
        acceptEventHandlers.set(event, handler);
      });

      registerDuelHandlers(
        acceptSocket as unknown as import("socket.io").Socket,
        mockServer as unknown as import("socket.io").Server,
      );
    });

    it("should emit error if invitation not found", async () => {
      const handler = acceptEventHandlers.get(DUEL_EVENTS.ACCEPT)!;
      mockGetInvitation.mockReturnValueOnce(undefined);

      await handler({ invitationId: "nonexistent" });

      expect(acceptSocket.emit).toHaveBeenCalledWith(DUEL_EVENTS.ERROR, {
        message: "Invitation not found or expired",
      });
    });

    it("should emit error if user is not the target (authorization)", async () => {
      const handler = eventHandlers.get(DUEL_EVENTS.ACCEPT)!; // user-1 (not target)
      mockGetInvitation.mockReturnValueOnce(
        createMockInvitation({ targetId: "user-2" }) as any,
      );

      await handler({ invitationId: "inv-1" });

      expect(mockSocket.emit).toHaveBeenCalledWith(DUEL_EVENTS.ERROR, {
        message: "Not authorized",
      });
      expect(mockRemoveInvitation).not.toHaveBeenCalled();
    });

    it("should emit error if inviter went offline", async () => {
      const handler = acceptEventHandlers.get(DUEL_EVENTS.ACCEPT)!;
      mockGetInvitation.mockReturnValueOnce(createMockInvitation() as any);
      mockGetUserSocketIds.mockReturnValueOnce([]); // inviter offline
      mockGetUserSocketIds.mockReturnValueOnce(["socket-2"]); // accepter

      await handler({ invitationId: "inv-1" });

      expect(acceptSocket.emit).toHaveBeenCalledWith(DUEL_EVENTS.ERROR, {
        message: "Challenger went offline",
      });
    });

    it("should emit error if accepter not found in DB", async () => {
      const handler = acceptEventHandlers.get(DUEL_EVENTS.ACCEPT)!;
      mockGetInvitation.mockReturnValueOnce(createMockInvitation() as any);
      mockGetUserSocketIds.mockReturnValueOnce(["socket-1"]); // inviter online
      mockGetUserSocketIds.mockReturnValueOnce(["socket-2"]); // accepter
      mockFindById.mockResolvedValueOnce(null); // accepter not found

      await handler({ invitationId: "inv-1" });

      expect(acceptSocket.emit).toHaveBeenCalledWith(DUEL_EVENTS.ERROR, {
        message: "User not found",
      });
    });

    it("should create sequence game room and notify both players on success", async () => {
      const handler = acceptEventHandlers.get(DUEL_EVENTS.ACCEPT)!;
      const invitation = createMockInvitation({ gameType: "sequence" });

      mockGetInvitation.mockReturnValueOnce(invitation as any);
      mockGetUserSocketIds.mockReturnValueOnce(["socket-1"]); // inviter
      mockGetUserSocketIds.mockReturnValueOnce(["socket-2"]); // accepter
      mockFindById.mockResolvedValueOnce(
        createMockUser("user-2", "Player 2", { rankPoints: 75 }) as any,
      );
      mockGetRoom.mockReturnValueOnce({ id: "room-1" } as any);

      // Mock io.in().fetchSockets()
      const mockInviterSocket = {
        id: "socket-1",
        join: vi.fn(),
      };
      (mockServer as any).in = vi.fn(() => ({
        fetchSockets: vi.fn().mockResolvedValueOnce([mockInviterSocket]),
      }));

      await handler({ invitationId: "inv-1" });

      // Should remove invitation
      expect(mockRemoveInvitation).toHaveBeenCalledWith("inv-1");

      // Should create sequence game room
      expect(mockSequenceCreateRoom).toHaveBeenCalledWith(
        expect.stringContaining("duel-"),
        expect.objectContaining({
          id: "user-1",
          name: "Player 1",
          socketId: "socket-1",
        }),
        expect.objectContaining({
          id: "user-2",
          name: "Player 2",
          socketId: "socket-2",
        }),
        expect.objectContaining({ rated: true, matchType: "duel" }),
      );

      // Should NOT create chimp room
      expect(mockChimpCreateRoom).not.toHaveBeenCalled();

      // Should emit MATCH_FOUND to both
      expect(mockServer.to).toHaveBeenCalledWith("socket-1");
      expect(mockServer.to).toHaveBeenCalledWith("socket-2");

      // Should broadcast live games
      expect(mockBroadcastLiveGames).toHaveBeenCalled();
    });

    it("should create chimp game room for chimp game type", async () => {
      const handler = acceptEventHandlers.get(DUEL_EVENTS.ACCEPT)!;
      const invitation = createMockInvitation({ gameType: "chimp" });

      mockGetInvitation.mockReturnValueOnce(invitation as any);
      mockGetUserSocketIds.mockReturnValueOnce(["socket-1"]);
      mockGetUserSocketIds.mockReturnValueOnce(["socket-2"]);
      mockFindById.mockResolvedValueOnce(
        createMockUser("user-2", "Player 2") as any,
      );
      mockGetRoom.mockReturnValueOnce({ id: "room-1" } as any);

      (mockServer as any).in = vi.fn(() => ({
        fetchSockets: vi
          .fn()
          .mockResolvedValueOnce([{ id: "socket-1", join: vi.fn() }]),
      }));

      await handler({ invitationId: "inv-1" });

      expect(mockChimpCreateRoom).toHaveBeenCalledWith(
        expect.stringContaining("duel-"),
        expect.objectContaining({ id: "user-1" }),
        expect.objectContaining({ id: "user-2" }),
        expect.objectContaining({ rated: true, matchType: "duel" }),
      );
      expect(mockSequenceCreateRoom).not.toHaveBeenCalled();
    });

    it("should emit error if game room creation fails (getRoom returns null)", async () => {
      const handler = acceptEventHandlers.get(DUEL_EVENTS.ACCEPT)!;

      mockGetInvitation.mockReturnValueOnce(createMockInvitation() as any);
      mockGetUserSocketIds.mockReturnValueOnce(["socket-1"]);
      mockGetUserSocketIds.mockReturnValueOnce(["socket-2"]);
      mockFindById.mockResolvedValueOnce(
        createMockUser("user-2", "Player 2") as any,
      );
      mockGetRoom.mockReturnValueOnce(undefined); // room creation failed

      (mockServer as any).in = vi.fn(() => ({
        fetchSockets: vi
          .fn()
          .mockResolvedValueOnce([{ id: "socket-1", join: vi.fn() }]),
      }));

      await handler({ invitationId: "inv-1" });

      expect(acceptSocket.emit).toHaveBeenCalledWith(DUEL_EVENTS.ERROR, {
        message: "Failed to create game room",
      });
    });

    it("should use socket.id as fallback when accepter has no socket IDs via presence", async () => {
      const handler = acceptEventHandlers.get(DUEL_EVENTS.ACCEPT)!;

      mockGetInvitation.mockReturnValueOnce(createMockInvitation() as any);
      mockGetUserSocketIds.mockReturnValueOnce(["socket-1"]); // inviter
      mockGetUserSocketIds.mockReturnValueOnce([]); // accepter — no socket IDs
      mockFindById.mockResolvedValueOnce(
        createMockUser("user-2", "Player 2") as any,
      );
      mockGetRoom.mockReturnValueOnce({ id: "room-1" } as any);

      (mockServer as any).in = vi.fn(() => ({
        fetchSockets: vi
          .fn()
          .mockResolvedValueOnce([{ id: "socket-1", join: vi.fn() }]),
      }));

      await handler({ invitationId: "inv-1" });

      // accepterSocketId should fallback to socket.id
      expect(mockSequenceCreateRoom).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({ socketId: "socket-2" }), // socket.id used
        expect.anything(),
      );
    });

    it("should emit MATCH_FOUND with capitalized gameType display name", async () => {
      const handler = acceptEventHandlers.get(DUEL_EVENTS.ACCEPT)!;

      mockGetInvitation.mockReturnValueOnce(
        createMockInvitation({ gameType: "sequence" }) as any,
      );
      mockGetUserSocketIds.mockReturnValueOnce(["socket-1"]);
      mockGetUserSocketIds.mockReturnValueOnce(["socket-2"]);
      mockFindById.mockResolvedValueOnce(
        createMockUser("user-2", "Player 2") as any,
      );
      mockGetRoom.mockReturnValueOnce({ id: "room-1" } as any);

      const emitFn = vi.fn();
      (mockServer as any).to = vi.fn(() => ({ emit: emitFn }));
      (mockServer as any).in = vi.fn(() => ({
        fetchSockets: vi
          .fn()
          .mockResolvedValueOnce([{ id: "socket-1", join: vi.fn() }]),
      }));

      await handler({ invitationId: "inv-1" });

      // Check that MATCH_FOUND was emitted with "Sequence" (capitalized)
      expect(emitFn).toHaveBeenCalledWith(
        ARENA_EVENTS.MATCH_FOUND,
        expect.objectContaining({
          gameType: "Sequence",
        }),
      );
    });

    it("should join both players to the socket room", async () => {
      const handler = acceptEventHandlers.get(DUEL_EVENTS.ACCEPT)!;

      mockGetInvitation.mockReturnValueOnce(createMockInvitation() as any);
      mockGetUserSocketIds.mockReturnValueOnce(["socket-1"]);
      mockGetUserSocketIds.mockReturnValueOnce(["socket-2"]);
      mockFindById.mockResolvedValueOnce(
        createMockUser("user-2", "Player 2") as any,
      );
      mockGetRoom.mockReturnValueOnce({ id: "room-1" } as any);

      const inviterJoin = vi.fn();
      (mockServer as any).in = vi.fn(() => ({
        fetchSockets: vi
          .fn()
          .mockResolvedValueOnce([{ id: "socket-1", join: inviterJoin }]),
      }));

      await handler({ invitationId: "inv-1" });

      // Inviter socket should join room
      expect(inviterJoin).toHaveBeenCalled();

      // Accepter socket should join room
      expect(acceptSocket.join).toHaveBeenCalled();
    });

    it("should handle exception and emit error", async () => {
      const handler = acceptEventHandlers.get(DUEL_EVENTS.ACCEPT)!;

      mockGetInvitation.mockImplementationOnce(() => {
        throw new Error("Unexpected DB failure");
      });

      await handler({ invitationId: "inv-1" });

      expect(acceptSocket.emit).toHaveBeenCalledWith(DUEL_EVENTS.ERROR, {
        message: "Unexpected DB failure",
      });
    });
  });

  // ==========================================
  // DECLINE
  // ==========================================
  describe("DECLINE event", () => {
    let declineSocket: MockSocket;
    let declineEventHandlers: Map<string, Function>;

    beforeEach(() => {
      declineSocket = createMockSocket("socket-2", "user-2", "Player 2");
      declineEventHandlers = new Map();
      declineSocket.on = vi.fn((event: string, handler: Function) => {
        declineEventHandlers.set(event, handler);
      });

      registerDuelHandlers(
        declineSocket as unknown as import("socket.io").Socket,
        mockServer as unknown as import("socket.io").Server,
      );
    });

    it("should silently ignore if invitation not found", () => {
      const handler = declineEventHandlers.get(DUEL_EVENTS.DECLINE)!;
      mockGetInvitation.mockReturnValueOnce(undefined);

      handler({ invitationId: "nonexistent" });

      expect(declineSocket.emit).not.toHaveBeenCalled();
      expect(mockRemoveInvitation).not.toHaveBeenCalled();
    });

    it("should emit error if user is not the target (authorization)", () => {
      // user-1 tries to decline an invitation targeting user-2
      const handler = eventHandlers.get(DUEL_EVENTS.DECLINE)!;
      mockGetInvitation.mockReturnValueOnce(
        createMockInvitation({ targetId: "user-2" }) as any,
      );

      handler({ invitationId: "inv-1" });

      expect(mockSocket.emit).toHaveBeenCalledWith(DUEL_EVENTS.ERROR, {
        message: "Not authorized",
      });
      expect(mockRemoveInvitation).not.toHaveBeenCalled();
    });

    it("should remove invitation and notify inviter on successful decline", () => {
      const handler = declineEventHandlers.get(DUEL_EVENTS.DECLINE)!;
      mockGetInvitation.mockReturnValueOnce(createMockInvitation() as any);

      handler({ invitationId: "inv-1" });

      // Should remove invitation
      expect(mockRemoveInvitation).toHaveBeenCalledWith("inv-1");

      // Should notify inviter via io.to
      expect(mockServer.to).toHaveBeenCalledWith("user:user-1");
    });

    it("should send decline payload with invitationId and declinedBy", () => {
      const handler = declineEventHandlers.get(DUEL_EVENTS.DECLINE)!;
      mockGetInvitation.mockReturnValueOnce(createMockInvitation() as any);

      const emitFn = vi.fn();
      (mockServer as any).to = vi.fn(() => ({ emit: emitFn }));

      handler({ invitationId: "inv-1" });

      expect(emitFn).toHaveBeenCalledWith(DUEL_EVENTS.DECLINE, {
        invitationId: "inv-1",
        declinedBy: "user-2",
      });
    });

    it("should handle exception and emit error", () => {
      const handler = declineEventHandlers.get(DUEL_EVENTS.DECLINE)!;

      mockGetInvitation.mockImplementationOnce(() => {
        throw new Error("Internal error");
      });

      handler({ invitationId: "inv-1" });

      expect(declineSocket.emit).toHaveBeenCalledWith(DUEL_EVENTS.ERROR, {
        message: "Internal error",
      });
    });
  });

  // ==========================================
  // VALIDATION ORDER
  // ==========================================
  describe("validation order", () => {
    it("should check self-challenge before friendship check", async () => {
      const handler = eventHandlers.get(DUEL_EVENTS.SEND_INVITE)!;

      await handler({
        targetUserId: "user-1",
        gameType: "sequence",
        rated: true,
      });

      expect(mockSocket.emit).toHaveBeenCalledWith(DUEL_EVENTS.ERROR, {
        message: "Cannot challenge yourself",
      });
      // areFriends should NOT have been called
      expect(mockAreFriends).not.toHaveBeenCalled();
    });

    it("should check friendship before online status", async () => {
      const handler = eventHandlers.get(DUEL_EVENTS.SEND_INVITE)!;
      mockAreFriends.mockResolvedValueOnce(false);

      await handler({
        targetUserId: "user-2",
        gameType: "sequence",
        rated: true,
      });

      expect(mockAreFriends).toHaveBeenCalled();
      // isUserOnline should NOT have been called
      expect(mockIsUserOnline).not.toHaveBeenCalled();
    });

    it("should check online status before game type validation", async () => {
      const handler = eventHandlers.get(DUEL_EVENTS.SEND_INVITE)!;
      mockAreFriends.mockResolvedValueOnce(true);
      mockIsUserOnline.mockReturnValueOnce(false);

      await handler({
        targetUserId: "user-2",
        gameType: "invalid",
        rated: true,
      });

      expect(mockIsUserOnline).toHaveBeenCalled();
      expect(mockSocket.emit).toHaveBeenCalledWith(DUEL_EVENTS.ERROR, {
        message: "Player is offline",
      });
      // findById should NOT have been called
      expect(mockFindById).not.toHaveBeenCalled();
    });
  });
});
