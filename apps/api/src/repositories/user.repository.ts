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
};
