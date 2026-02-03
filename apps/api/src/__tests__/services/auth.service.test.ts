/**
 * Auth Service Tests
 * Unit tests for user authentication and token management
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { authService, AuthServiceError } from '../../services/auth.service';
import { userRepository } from '../../repositories/user.repository';
import { refreshTokenRepository } from '../../repositories/refresh-token.repository';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Mock repositories
vi.mock('../../repositories/user.repository', () => ({
    userRepository: {
        exists: vi.fn(),
        create: vi.fn(),
        findByEmail: vi.fn(),
    }
}));

vi.mock('../../repositories/refresh-token.repository', () => ({
    refreshTokenRepository: {
        create: vi.fn(),
        findByToken: vi.fn(),
        deleteByToken: vi.fn(),
        deleteAllForUser: vi.fn(),
    }
}));

// Mock bcrypt and jwt
vi.mock('bcrypt', () => ({
    default: {
        hash: vi.fn(),
        compare: vi.fn(),
    }
}));

vi.mock('jsonwebtoken', () => ({
    default: {
        sign: vi.fn(),
    }
}));

// Mock config
vi.mock('../../config/env', () => ({
    env: {
        JWT_SECRET: 'test-secret',
        ACCESS_TOKEN_EXPIRES_IN: '1h',
        REFRESH_TOKEN_EXPIRES_DAYS: 7,
        SALT_ROUNDS: 10,
    }
}));

describe('Auth Service', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    // ==========================================
    // REGISTER
    // ==========================================

    describe('register', () => {
        const input = {
            name: 'Test user',
            email: 'test@example.com',
            password: 'password123'
        };

        it('should throw error if user already exists', async () => {
            vi.mocked(userRepository.exists).mockResolvedValue(true);

            await expect(authService.register(input))
                .rejects.toThrow(AuthServiceError);

            expect(userRepository.exists).toHaveBeenCalledWith(input.email);
        });

        it('should create user and return tokens', async () => {
            const mockUser = { id: 'u1', name: 'Test user', email: 'test@example.com', createdAt: new Date() };
            vi.mocked(userRepository.exists).mockResolvedValue(false);
            vi.mocked(bcrypt.hash).mockImplementation(() => Promise.resolve('hashed_pw') as any);
            vi.mocked(userRepository.create).mockResolvedValue(mockUser as any);
            vi.mocked(jwt.sign).mockReturnValue('access_token' as any);
            vi.mocked(refreshTokenRepository.create).mockResolvedValue({ token: 'refresh_token' } as any);

            const result = await authService.register(input);

            expect(userRepository.create).toHaveBeenCalledWith({
                name: input.name,
                email: input.email,
                passwordHash: 'hashed_pw'
            });
            expect(result.accessToken).toBe('access_token');
            expect(result.refreshToken).toBe('refresh_token');
            expect(result.user.id).toBe(mockUser.id);
        });
    });

    // ==========================================
    // LOGIN
    // ==========================================

    describe('login', () => {
        const input = { email: 'test@example.com', password: 'pw' };

        it('should throw if user not found', async () => {
            vi.mocked(userRepository.findByEmail).mockResolvedValue(null);

            await expect(authService.login(input)).rejects.toThrow('Invalid email or password');
        });

        it('should throw if password incorrect', async () => {
            vi.mocked(userRepository.findByEmail).mockResolvedValue({ id: 'u1' } as any);
            vi.mocked(bcrypt.compare).mockImplementation(() => Promise.resolve(false) as any);

            await expect(authService.login(input)).rejects.toThrow('Invalid email or password');
        });

        it('should return tokens on success', async () => {
            const mockUser = { id: 'u1', name: 'User', email: 'test@example.com', passwordHash: 'hash', createdAt: new Date() };
            vi.mocked(userRepository.findByEmail).mockResolvedValue(mockUser as any);
            vi.mocked(bcrypt.compare).mockImplementation(() => Promise.resolve(true) as any);
            vi.mocked(jwt.sign).mockReturnValue('at' as any);
            vi.mocked(refreshTokenRepository.create).mockResolvedValue({ token: 'rt' } as any);

            const result = await authService.login(input);

            expect(result.accessToken).toBe('at');
            expect(result.refreshToken).toBe('rt');
        });
    });

    // ==========================================
    // REFRESH
    // ==========================================

    describe('refresh', () => {
        it('should throw if token not found', async () => {
            vi.mocked(refreshTokenRepository.findByToken).mockResolvedValue(null);
            await expect(authService.refresh('token')).rejects.toThrow('Invalid refresh token');
        });

        it('should throw and delete if token expired', async () => {
            const expiredDate = new Date();
            expiredDate.setHours(expiredDate.getHours() - 1);

            vi.mocked(refreshTokenRepository.findByToken).mockResolvedValue({
                token: 't',
                expiresAt: expiredDate
            } as any);

            await expect(authService.refresh('t')).rejects.toThrow('Refresh token expired');
            expect(refreshTokenRepository.deleteByToken).toHaveBeenCalledWith('t');
        });

        it('should return new access token if valid', async () => {
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 1);

            vi.mocked(refreshTokenRepository.findByToken).mockResolvedValue({
                token: 't',
                userId: 'u1',
                expiresAt: futureDate,
                user: { id: 'u1', name: 'N', email: 'E', createdAt: new Date() }
            } as any);
            vi.mocked(jwt.sign).mockReturnValue('new_at' as any);

            const result = await authService.refresh('t');

            expect(result.accessToken).toBe('new_at');
            expect(result.user.id).toBe('u1');
        });
    });
});
