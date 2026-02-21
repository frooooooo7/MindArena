import { prisma } from "../lib/prisma";

export interface CreateUserData {
    name: string;
    email: string;
    passwordHash: string;
}

export const userRepository = {
    async findByEmail(email: string) {
        return prisma.user.findUnique({
            where: { email },
        });
    },

    async findById(id: string) {
        return prisma.user.findUnique({
            where: { id },
        });
    },

    async create(data: CreateUserData) {
        return prisma.user.create({
            data,
        });
    },

    async exists(email: string) {
        const user = await prisma.user.findUnique({
            where: { email },
            select: { id: true },
        });
        return !!user;
    },

    async updateRank(id: string, rankPoints: number, rankName: string) {
        return prisma.user.update({
            where: { id },
            data: { rankPoints, rankName },
        });
    },

    async getLeaderboard(limit = 100) {
        return prisma.user.findMany({
            orderBy: [
                { rankPoints: 'desc' },
                { createdAt: 'asc' }
            ],
            take: limit,
            select: {
                id: true,
                name: true,
                rankPoints: true,
                rankName: true,
                _count: {
                    select: { gameResults: true }
                }
            }
        });
    },

    async getTotalActivePlayers() {
        // Active last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        // Optimised: group by userId from game results which removes N+1 table scan issue
        const activeUsers = await prisma.gameResult.groupBy({
            by: ['userId'],
            where: {
                createdAt: {
                    gte: thirtyDaysAgo
                }
            }
        });
        
        return activeUsers.length;
    },

    async getTotalPlayers() {
        return prisma.user.count();
    },

    async getPlayerRank(userId: string) {
        const user = await this.findById(userId);
        if (!user) return null;

        // Count how many players have STRICTLY MORE points, or SAME points but joined earlier (tie-breaker)
        const higherRankingPlayers = await prisma.user.count({
            where: {
                OR: [
                    { rankPoints: { gt: user.rankPoints } },
                    {
                        rankPoints: user.rankPoints,
                        createdAt: { lt: user.createdAt }
                    }
                ]
            }
        });

        // The user's rank is the number of players with more points + 1
        return higherRankingPlayers + 1;
    }
};
