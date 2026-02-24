/**
 * Friend Service Tests
 * Tests for friend request lifecycle: send, accept, decline, search, list
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the repository before importing the service
vi.mock('../../repositories/friend.repository', () => ({
  friendRepository: {
    getFriendship: vi.fn(),
    createRequest: vi.fn(),
    updateStatus: vi.fn(),
    deleteFriendship: vi.fn(),
    getFriendsForUser: vi.fn(),
    getPendingRequests: vi.fn(),
    getSentRequests: vi.fn(),
    searchUsersByName: vi.fn(),
    findFriendshipByIdForUser: vi.fn(),
    findPendingRequestForUser: vi.fn(),
  },
}));

// Mock the event bus
vi.mock('../../utils/event-bus', () => ({
  eventBus: {
    emit: vi.fn(),
    on: vi.fn(),
  },
  EVENTS: {
    FRIEND_REQUEST_SENT: 'FRIEND_REQUEST:SENT',
    FRIEND_REQUEST_ACCEPTED: 'FRIEND_REQUEST:ACCEPTED',
  },
}));

import { friendService } from '../../services/friend.service';
import { friendRepository } from '../../repositories/friend.repository';
import { eventBus, EVENTS } from '../../utils/event-bus';

const mockGetFriendship = vi.mocked(friendRepository.getFriendship);
const mockCreateRequest = vi.mocked(friendRepository.createRequest);
const mockUpdateStatus = vi.mocked(friendRepository.updateStatus);
const mockDeleteFriendship = vi.mocked(friendRepository.deleteFriendship);
const mockGetFriendsForUser = vi.mocked(friendRepository.getFriendsForUser);
const mockGetPendingRequests = vi.mocked(friendRepository.getPendingRequests);
const mockGetSentRequests = vi.mocked(friendRepository.getSentRequests);
const mockSearchUsersByName = vi.mocked(friendRepository.searchUsersByName);
const mockFindByIdForUser = vi.mocked(friendRepository.findFriendshipByIdForUser);
const mockFindPendingForUser = vi.mocked(friendRepository.findPendingRequestForUser);
const mockEventBusEmit = vi.mocked(eventBus.emit);

// ==========================================
// HELPERS
// ==========================================

function createMockFriendship(overrides: Partial<{
  id: string;
  requesterId: string;
  addresseeId: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}> = {}) {
  return {
    id: overrides.id ?? 'friendship-1',
    requesterId: overrides.requesterId ?? 'user-1',
    addresseeId: overrides.addresseeId ?? 'user-2',
    status: overrides.status ?? 'PENDING',
    createdAt: overrides.createdAt ?? new Date('2026-01-01'),
    updatedAt: overrides.updatedAt ?? new Date('2026-01-01'),
  };
}

function createMockFriendshipWithUsers(overrides: Partial<{
  id: string;
  requesterId: string;
  addresseeId: string;
  status: string;
}> = {}) {
  const base = createMockFriendship(overrides);
  return {
    ...base,
    requester: { id: base.requesterId, name: `Player_${base.requesterId}`, rankName: 'Neuron', rankPoints: 50 },
    addressee: { id: base.addresseeId, name: `Player_${base.addresseeId}`, rankName: 'Neuron', rankPoints: 30 },
  };
}

// ==========================================
// TESTS
// ==========================================

describe('Friend Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ==========================================
  // searchUsers
  // ==========================================
  describe('searchUsers', () => {
    it('should return paginated search results', async () => {
      const mockUsers = [
        { id: 'u1', name: 'Alice', rankName: 'Neuron', rankPoints: 50 },
        { id: 'u2', name: 'Alina', rankName: 'Synapsa', rankPoints: 120 },
      ];
      mockSearchUsersByName.mockResolvedValueOnce({ users: mockUsers, totalCount: 12 });

      const result = await friendService.searchUsers('Ali', 'current-user', 1, 10);

      expect(mockSearchUsersByName).toHaveBeenCalledWith('Ali', 'current-user', 0, 10);
      expect(result.users).toHaveLength(2);
      expect(result.page).toBe(1);
      expect(result.totalPages).toBe(2); // ceil(12/10)
      expect(result.totalCount).toBe(12);
    });

    it('should correctly calculate skip for page 2', async () => {
      mockSearchUsersByName.mockResolvedValueOnce({ users: [], totalCount: 0 });

      await friendService.searchUsers('test', 'uid', 2, 10);

      expect(mockSearchUsersByName).toHaveBeenCalledWith('test', 'uid', 10, 10);
    });

    it('should handle zero results gracefully', async () => {
      mockSearchUsersByName.mockResolvedValueOnce({ users: [], totalCount: 0 });

      const result = await friendService.searchUsers('xyz', 'uid', 1, 10);

      expect(result.users).toHaveLength(0);
      expect(result.totalPages).toBe(0);
    });
  });

  // ==========================================
  // sendRequest
  // ==========================================
  describe('sendRequest', () => {
    it('should create a new friend request and emit event', async () => {
      mockGetFriendship.mockResolvedValueOnce(null);
      const created = createMockFriendship();
      mockCreateRequest.mockResolvedValueOnce(created as any);

      const result = await friendService.sendRequest('user-1', 'user-2');

      expect(mockGetFriendship).toHaveBeenCalledWith('user-1', 'user-2');
      expect(mockCreateRequest).toHaveBeenCalledWith('user-1', 'user-2');
      expect(result.id).toBe('friendship-1');
      expect(result.status).toBe('PENDING');
      expect(result.requesterId).toBe('user-1');
      expect(result.addresseeId).toBe('user-2');
    });

    it('should emit FRIEND_REQUEST_SENT event with correct payload', async () => {
      mockGetFriendship.mockResolvedValueOnce(null);
      mockCreateRequest.mockResolvedValueOnce(createMockFriendship() as any);

      await friendService.sendRequest('user-1', 'user-2');

      expect(mockEventBusEmit).toHaveBeenCalledWith(
        EVENTS.FRIEND_REQUEST_SENT,
        expect.objectContaining({
          targetUserId: 'user-2',
          request: expect.objectContaining({ requesterId: 'user-1' }),
        })
      );
    });

    it('should throw if sending to yourself', async () => {
      await expect(
        friendService.sendRequest('user-1', 'user-1')
      ).rejects.toThrow('Cannot send friend request to yourself');

      expect(mockGetFriendship).not.toHaveBeenCalled();
      expect(mockCreateRequest).not.toHaveBeenCalled();
    });

    it('should throw if friendship already exists', async () => {
      mockGetFriendship.mockResolvedValueOnce(createMockFriendshipWithUsers() as any);

      await expect(
        friendService.sendRequest('user-1', 'user-2')
      ).rejects.toThrow('Friendship or request already exists');

      expect(mockCreateRequest).not.toHaveBeenCalled();
    });

    it('should handle Prisma unique constraint violation (P2002)', async () => {
      mockGetFriendship.mockResolvedValueOnce(null);
      const prismaError = Object.assign(new Error('Unique constraint'), { code: 'P2002' });
      mockCreateRequest.mockRejectedValueOnce(prismaError);

      await expect(
        friendService.sendRequest('user-1', 'user-2')
      ).rejects.toThrow('Friendship or request already exists');
    });

    it('should re-throw non-P2002 database errors', async () => {
      mockGetFriendship.mockResolvedValueOnce(null);
      mockCreateRequest.mockRejectedValueOnce(new Error('DB connection failed'));

      await expect(
        friendService.sendRequest('user-1', 'user-2')
      ).rejects.toThrow('DB connection failed');
    });
  });

  // ==========================================
  // acceptRequest
  // ==========================================
  describe('acceptRequest', () => {
    it('should accept a pending request and return updated DTO', async () => {
      mockFindPendingForUser.mockResolvedValueOnce(createMockFriendship() as any);
      const accepted = createMockFriendshipWithUsers({ status: 'ACCEPTED' });
      mockUpdateStatus.mockResolvedValueOnce(accepted as any);

      const result = await friendService.acceptRequest('user-2', 'friendship-1');

      expect(mockFindPendingForUser).toHaveBeenCalledWith('friendship-1', 'user-2');
      expect(mockUpdateStatus).toHaveBeenCalledWith('friendship-1', 'ACCEPTED');
      expect(result.status).toBe('ACCEPTED');
      expect(result.friend).toEqual(
        expect.objectContaining({ id: 'user-1', name: 'Player_user-1' })
      );
    });

    it('should emit FRIEND_REQUEST_ACCEPTED event', async () => {
      mockFindPendingForUser.mockResolvedValueOnce(createMockFriendship() as any);
      mockUpdateStatus.mockResolvedValueOnce(createMockFriendshipWithUsers({ status: 'ACCEPTED' }) as any);

      await friendService.acceptRequest('user-2', 'friendship-1');

      expect(mockEventBusEmit).toHaveBeenCalledWith(
        EVENTS.FRIEND_REQUEST_ACCEPTED,
        expect.objectContaining({
          requesterId: 'user-1',
          addresseeId: 'user-2',
        })
      );
    });

    it('should throw if request not found (wrong ID)', async () => {
      mockFindPendingForUser.mockResolvedValueOnce(null);

      await expect(
        friendService.acceptRequest('user-2', 'nonexistent')
      ).rejects.toThrow('Request not found or not authorized to accept');

      expect(mockUpdateStatus).not.toHaveBeenCalled();
    });

    it('should throw if user is not the addressee (authorization check)', async () => {
      // findPendingRequestForUser checks addresseeId, so returns null for wrong user
      mockFindPendingForUser.mockResolvedValueOnce(null);

      await expect(
        friendService.acceptRequest('user-3', 'friendship-1')
      ).rejects.toThrow('Request not found or not authorized to accept');
    });
  });

  // ==========================================
  // declineOrCancelRequest
  // ==========================================
  describe('declineOrCancelRequest', () => {
    it('should delete a friendship when user is the requester', async () => {
      mockFindByIdForUser.mockResolvedValueOnce(createMockFriendship() as any);
      mockDeleteFriendship.mockResolvedValueOnce({} as any);

      await friendService.declineOrCancelRequest('user-1', 'friendship-1');

      expect(mockFindByIdForUser).toHaveBeenCalledWith('friendship-1', 'user-1');
      expect(mockDeleteFriendship).toHaveBeenCalledWith('friendship-1');
    });

    it('should delete a friendship when user is the addressee', async () => {
      mockFindByIdForUser.mockResolvedValueOnce(createMockFriendship() as any);
      mockDeleteFriendship.mockResolvedValueOnce({} as any);

      await friendService.declineOrCancelRequest('user-2', 'friendship-1');

      expect(mockFindByIdForUser).toHaveBeenCalledWith('friendship-1', 'user-2');
      expect(mockDeleteFriendship).toHaveBeenCalledWith('friendship-1');
    });

    it('should throw if friendship not found or unauthorized', async () => {
      mockFindByIdForUser.mockResolvedValueOnce(null);

      await expect(
        friendService.declineOrCancelRequest('user-3', 'friendship-1')
      ).rejects.toThrow('Request not found or not authorized');

      expect(mockDeleteFriendship).not.toHaveBeenCalled();
    });

    it('should use a single query for authorization (no N+1)', async () => {
      mockFindByIdForUser.mockResolvedValueOnce(createMockFriendship() as any);
      mockDeleteFriendship.mockResolvedValueOnce({} as any);

      await friendService.declineOrCancelRequest('user-1', 'friendship-1');

      // Verify ONLY findByIdForUser was called (not getFriendsForUser, getPendingRequests, getSentRequests)
      expect(mockFindByIdForUser).toHaveBeenCalledTimes(1);
      expect(mockGetFriendsForUser).not.toHaveBeenCalled();
      expect(mockGetPendingRequests).not.toHaveBeenCalled();
      expect(mockGetSentRequests).not.toHaveBeenCalled();
    });
  });

  // ==========================================
  // getFriendsList
  // ==========================================
  describe('getFriendsList', () => {
    it('should return friends with correct friend DTO (other user)', async () => {
      const friendships = [
        createMockFriendshipWithUsers({ id: 'f1', requesterId: 'me', addresseeId: 'other1', status: 'ACCEPTED' }),
        createMockFriendshipWithUsers({ id: 'f2', requesterId: 'other2', addresseeId: 'me', status: 'ACCEPTED' }),
      ];
      mockGetFriendsForUser.mockResolvedValueOnce(friendships as any);

      const result = await friendService.getFriendsList('me');

      expect(result).toHaveLength(2);
      // When I'm requester, friend should be addressee
      expect(result[0].friend?.id).toBe('other1');
      // When I'm addressee, friend should be requester
      expect(result[1].friend?.id).toBe('other2');
    });

    it('should return empty array when no friends', async () => {
      mockGetFriendsForUser.mockResolvedValueOnce([]);

      const result = await friendService.getFriendsList('lonely-user');

      expect(result).toEqual([]);
    });

    it('should include rank info in friend DTO', async () => {
      const friendships = [
        createMockFriendshipWithUsers({ requesterId: 'me', addresseeId: 'friend-1', status: 'ACCEPTED' }),
      ];
      mockGetFriendsForUser.mockResolvedValueOnce(friendships as any);

      const result = await friendService.getFriendsList('me');

      expect(result[0].friend?.rankName).toBe('Neuron');
      expect(result[0].friend?.rankPoints).toBe(30); // addressee points
    });
  });

  // ==========================================
  // getPendingRequests
  // ==========================================
  describe('getPendingRequests', () => {
    it('should return both received and sent requests', async () => {
      const received = [
        createMockFriendshipWithUsers({ id: 'r1', requesterId: 'sender', addresseeId: 'me' }),
      ];
      const sent = [
        createMockFriendshipWithUsers({ id: 's1', requesterId: 'me', addresseeId: 'target' }),
      ];
      mockGetPendingRequests.mockResolvedValueOnce(received as any);
      mockGetSentRequests.mockResolvedValueOnce(sent as any);

      const result = await friendService.getPendingRequests('me');

      expect(result.received).toHaveLength(1);
      expect(result.sent).toHaveLength(1);
      // Received: friend should be the requester (who sent us the request)
      expect(result.received[0].friend?.id).toBe('sender');
      // Sent: friend should be the addressee (who we sent the request to)
      expect(result.sent[0].friend?.id).toBe('target');
    });

    it('should return empty arrays when no pending requests', async () => {
      mockGetPendingRequests.mockResolvedValueOnce([]);
      mockGetSentRequests.mockResolvedValueOnce([]);

      const result = await friendService.getPendingRequests('me');

      expect(result.received).toEqual([]);
      expect(result.sent).toEqual([]);
    });

    it('should serialize dates as ISO strings', async () => {
      const received = [
        createMockFriendshipWithUsers({ id: 'r1', requesterId: 'sender', addresseeId: 'me' }),
      ];
      mockGetPendingRequests.mockResolvedValueOnce(received as any);
      mockGetSentRequests.mockResolvedValueOnce([]);

      const result = await friendService.getPendingRequests('me');

      expect(result.received[0].createdAt).toBe('2026-01-01T00:00:00.000Z');
    });
  });
});
