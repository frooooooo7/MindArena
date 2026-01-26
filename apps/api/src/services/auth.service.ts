import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { userRepository } from "../repositories/user.repository";
import { refreshTokenRepository } from "../repositories/refresh-token.repository";
import { User } from "@mindarena/shared";

export interface RegisterInput {
    name: string;
    email: string;
    password: string;
}

export interface LoginInput {
    email: string;
    password: string;
}

export interface TokenPair {
    accessToken: string;
    refreshToken: string;
    user: User;
}

export class AuthServiceError extends Error {
    constructor(
        message: string,
        public statusCode: number
    ) {
        super(message);
        this.name = "AuthServiceError";
    }
}

const generateAccessToken = (userId: string): string => {
    return jwt.sign({ userId }, env.JWT_SECRET, { 
        expiresIn: env.ACCESS_TOKEN_EXPIRES_IN as jwt.SignOptions["expiresIn"]
    });
};

const createRefreshToken = async (userId: string): Promise<string> => {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + env.REFRESH_TOKEN_EXPIRES_DAYS);
    
    const token = await refreshTokenRepository.create({
        userId,
        expiresAt,
    });
    
    return token.token;
};

const formatUser = (user: { id: string; name: string; email: string; createdAt: Date }): User => ({
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
});

export const authService = {
    async register(input: RegisterInput): Promise<TokenPair> {
        const { name, email, password } = input;

        const exists = await userRepository.exists(email);
        if (exists) {
            throw new AuthServiceError("User with this email already exists", 409);
        }

        const passwordHash = await bcrypt.hash(password, env.SALT_ROUNDS);

        const user = await userRepository.create({
            name,
            email,
            passwordHash,
        });

        const accessToken = generateAccessToken(user.id);
        const refreshToken = await createRefreshToken(user.id);

        return {
            accessToken,
            refreshToken,
            user: formatUser(user),
        };
    },

    async login(input: LoginInput): Promise<TokenPair> {
        const { email, password } = input;

        const user = await userRepository.findByEmail(email);
        if (!user) {
            throw new AuthServiceError("Invalid email or password", 401);
        }

        const isValidPassword = await bcrypt.compare(password, user.passwordHash);
        if (!isValidPassword) {
            throw new AuthServiceError("Invalid email or password", 401);
        }

        const accessToken = generateAccessToken(user.id);
        const refreshToken = await createRefreshToken(user.id);

        return {
            accessToken,
            refreshToken,
            user: formatUser(user),
        };
    },

    async refresh(refreshToken: string): Promise<{ accessToken: string; user: User }> {
        const storedToken = await refreshTokenRepository.findByToken(refreshToken);
        
        if (!storedToken) {
            throw new AuthServiceError("Invalid refresh token", 401);
        }

        if (storedToken.expiresAt < new Date()) {
            await refreshTokenRepository.deleteByToken(refreshToken);
            throw new AuthServiceError("Refresh token expired", 401);
        }

        const accessToken = generateAccessToken(storedToken.userId);

        return {
            accessToken,
            user: formatUser(storedToken.user),
        };
    },

    async logout(refreshToken: string): Promise<void> {
        await refreshTokenRepository.deleteByToken(refreshToken);
    },

    async logoutAll(userId: string): Promise<void> {
        await refreshTokenRepository.deleteAllForUser(userId);
    },
};
