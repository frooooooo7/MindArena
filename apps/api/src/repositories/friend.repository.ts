import { prisma } from "../lib/prisma";
import type { FriendStatus } from "@prisma/client";

export class FriendRepository {
  async getFriendship(requesterId: string, addresseeId: string) {
    return prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId, addresseeId },
          { requesterId: addresseeId, addresseeId: requesterId },
        ],
      },
      include: {
        requester: { select: { id: true, name: true, rankName: true, rankPoints: true } },
        addressee: { select: { id: true, name: true, rankName: true, rankPoints: true } },
      }
    });
  }

  async createRequest(requesterId: string, addresseeId: string) {
    return prisma.friendship.create({
      data: {
        requesterId,
        addresseeId,
        status: "PENDING",
      },
    });
  }

  async updateStatus(id: string, status: FriendStatus) {
    return prisma.friendship.update({
      where: { id },
      data: { status },
      include: {
        requester: { select: { id: true, name: true, rankName: true, rankPoints: true } },
        addressee: { select: { id: true, name: true, rankName: true, rankPoints: true } },
      }
    });
  }
  
  async deleteFriendship(id: string) {
    return prisma.friendship.delete({
      where: { id }
    });
  }

  async getFriendsForUser(userId: string) {
    return prisma.friendship.findMany({
      where: {
        status: "ACCEPTED",
        OR: [{ requesterId: userId }, { addresseeId: userId }],
      },
      include: {
        requester: { select: { id: true, name: true, rankName: true, rankPoints: true } },
        addressee: { select: { id: true, name: true, rankName: true, rankPoints: true } },
      },
      orderBy: { updatedAt: "desc" },
    });
  }

  async getPendingRequests(userId: string) {
    return prisma.friendship.findMany({
      where: {
        status: "PENDING",
        addresseeId: userId,
      },
      include: {
        requester: { select: { id: true, name: true, rankName: true, rankPoints: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getSentRequests(userId: string) {
    return prisma.friendship.findMany({
      where: {
        status: "PENDING",
        requesterId: userId,
      },
      include: {
        addressee: { select: { id: true, name: true, rankName: true, rankPoints: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findFriendshipByIdForUser(id: string, userId: string) {
    return prisma.friendship.findFirst({
      where: {
        id,
        OR: [{ requesterId: userId }, { addresseeId: userId }],
      },
    });
  }

  async findPendingRequestForUser(requestId: string, addresseeId: string) {
    return prisma.friendship.findFirst({
      where: {
        id: requestId,
        addresseeId,
        status: "PENDING",
      },
    });
  }

  async searchUsersByName(query: string, userId: string, skip: number, take: number) {
    // Return users matching query, omitting the current user
    const sanitizedQuery = query.replace(/[%_\\]/g, '').trim();
    if (!sanitizedQuery) return { users: [], totalCount: 0 };

    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where: {
          id: { not: userId },
          name: { contains: sanitizedQuery, mode: "insensitive" },
        },
        select: {
          id: true,
          name: true,
          rankName: true,
          rankPoints: true,
        },
        orderBy: { rankPoints: "desc" },
        skip,
        take,
      }),
      prisma.user.count({
        where: {
          id: { not: userId },
          name: { contains: sanitizedQuery, mode: "insensitive" },
        },
      }),
    ]);
    
    return { users, totalCount };
  }
}

export const friendRepository = new FriendRepository();
