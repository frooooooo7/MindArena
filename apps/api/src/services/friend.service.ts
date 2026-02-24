import { friendRepository } from "../repositories/friend.repository";
import type { FriendshipDTO, FriendUserDTO, FriendStatus, SearchPlayersResponse } from "@mindarena/shared";
import { eventBus, EVENTS } from "../utils/event-bus";

export class FriendService {
  async searchUsers(query: string, userId: string, page: number, limit: number): Promise<SearchPlayersResponse> {
    const skip = (page - 1) * limit;
    const { users, totalCount } = await friendRepository.searchUsersByName(query, userId, skip, limit);
    
    return {
      users,
      page,
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
    };
  }

  async sendRequest(requesterId: string, addresseeId: string): Promise<FriendshipDTO> {
    if (requesterId === addresseeId) {
      throw new Error("Cannot send friend request to yourself");
    }

    const existing = await friendRepository.getFriendship(requesterId, addresseeId);
    if (existing) {
      throw new Error("Friendship or request already exists");
    }

    let newFriendship;
    try {
      newFriendship = await friendRepository.createRequest(requesterId, addresseeId);
    } catch (error: unknown) {
      if (
        error !== null &&
        typeof error === "object" &&
        "code" in error &&
        (error as Record<string, unknown>).code === "P2002"
      ) {
        throw new Error("Friendship or request already exists");
      }
      throw error;
    }
    
    // Payload for the sender's UI (friend = the person they sent the request to)
    const senderPayload: FriendshipDTO = {
      id: newFriendship.id,
      requesterId: newFriendship.requesterId,
      addresseeId: newFriendship.addresseeId,
      status: newFriendship.status as FriendStatus,
      createdAt: newFriendship.createdAt.toISOString(),
      friend: newFriendship.addressee as FriendUserDTO,
    };

    // Payload for the receiver's popup (friend = the person who sent the request)
    const receiverPayload: FriendshipDTO = {
      ...senderPayload,
      friend: newFriendship.requester as FriendUserDTO,
    };

    eventBus.emit(EVENTS.FRIEND_REQUEST_SENT, { 
      targetUserId: addresseeId, 
      request: receiverPayload 
    });

    return senderPayload;
  }

  async acceptRequest(userId: string, requestId: string): Promise<FriendshipDTO> {
    const friendship = await friendRepository.findPendingRequestForUser(requestId, userId);
    if (!friendship) {
      throw new Error("Request not found or not authorized to accept");
    }

    const accepted = await friendRepository.updateStatus(requestId, "ACCEPTED");
    
    const payload: FriendshipDTO = {
      id: accepted.id,
      requesterId: accepted.requesterId,
      addresseeId: accepted.addresseeId,
      status: accepted.status as FriendStatus,
      createdAt: accepted.createdAt.toISOString(),
      friend: accepted.requester as FriendUserDTO,
    };

    eventBus.emit(EVENTS.FRIEND_REQUEST_ACCEPTED, { 
      requesterId: accepted.requesterId,
      addresseeId: accepted.addresseeId, 
      request: payload 
    });

    return payload;
  }

  async declineOrCancelRequest(userId: string, requestId: string): Promise<void> {

    const friendship = await friendRepository.findFriendshipByIdForUser(requestId, userId);
    if (!friendship) {
      throw new Error("Request not found or not authorized");
    }

    await friendRepository.deleteFriendship(requestId);

    // Notify the other party so their UI updates in real-time
    const targetUserId = friendship.requesterId === userId 
      ? friendship.addresseeId 
      : friendship.requesterId;
    
    eventBus.emit(EVENTS.FRIEND_REMOVED, { 
      targetUserId, 
      friendshipId: requestId 
    });
  }

  async getFriendsList(userId: string): Promise<FriendshipDTO[]> {
    const list = await friendRepository.getFriendsForUser(userId);
    return list.map((f) => {
      const isRequester = f.requesterId === userId;
      return {
        id: f.id,
        requesterId: f.requesterId,
        addresseeId: f.addresseeId,
        status: f.status as FriendStatus,
        createdAt: f.createdAt.toISOString(),
        friend: (isRequester ? f.addressee : f.requester) as FriendUserDTO,
      };
    });
  }

  async getPendingRequests(userId: string): Promise<{ received: FriendshipDTO[], sent: FriendshipDTO[] }> {
    const pending = await friendRepository.getPendingRequests(userId);
    const sent = await friendRepository.getSentRequests(userId);

    const mapReceived = (f: typeof pending[number]): FriendshipDTO => ({
      id: f.id,
      requesterId: f.requesterId,
      addresseeId: f.addresseeId,
      status: f.status as FriendStatus,
      createdAt: f.createdAt.toISOString(),
      friend: f.requester as FriendUserDTO,
    });

    const mapSent = (f: typeof sent[number]): FriendshipDTO => ({
      id: f.id,
      requesterId: f.requesterId,
      addresseeId: f.addresseeId,
      status: f.status as FriendStatus,
      createdAt: f.createdAt.toISOString(),
      friend: f.addressee as FriendUserDTO,
    });

    return {
      received: pending.map(mapReceived),
      sent: sent.map(mapSent),
    };
  }
}

export const friendService = new FriendService();
