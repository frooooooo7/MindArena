import { prisma } from "../lib/prisma";
import crypto from "crypto";

export interface CreateRefreshTokenData {
    userId: string;
    expiresAt: Date;
}

export const refreshTokenRepository = {
    async create(data: CreateRefreshTokenData) {
        const token = crypto.randomBytes(64).toString("hex");
        return prisma.refreshToken.create({
            data: {
                token,
                userId: data.userId,
                expiresAt: data.expiresAt,
            },
        });
    },

    async findByToken(token: string) {
        return prisma.refreshToken.findUnique({
            where: { token },
            include: { user: true },
        });
    },

    async deleteByToken(token: string) {
        return prisma.refreshToken.delete({
            where: { token },
        }).catch(() => null); // Ignore if not found
    },

    async deleteAllForUser(userId: string) {
        return prisma.refreshToken.deleteMany({
            where: { userId },
        });
    },

    async deleteExpired() {
        return prisma.refreshToken.deleteMany({
            where: {
                expiresAt: { lt: new Date() },
            },
        });
    },
};
