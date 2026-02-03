/**
 * Test Utilities for MindArena API Tests
 */
import { vi, expect } from 'vitest';
import type { Server, Socket } from 'socket.io';

// ==========================================
// MOCK SOCKET FACTORY
// ==========================================

export interface MockSocket {
    id: string;
    data: { user?: { id: string; name: string } };
    connected: boolean;
    rooms: Set<string>;
    emit: ReturnType<typeof vi.fn>;
    join: ReturnType<typeof vi.fn>;
    on: ReturnType<typeof vi.fn>;
    to: ReturnType<typeof vi.fn>;
}

export function createMockSocket(id: string, userId?: string, userName?: string): MockSocket {
    const socket: MockSocket = {
        id,
        data: userId ? { user: { id: userId, name: userName || `Player_${id}` } } : {},
        connected: true,
        rooms: new Set([id]),
        emit: vi.fn(),
        join: vi.fn((room: string) => {
            socket.rooms.add(room);
        }),
        on: vi.fn(),
        to: vi.fn(() => ({ emit: vi.fn() })),
    };
    return socket;
}

// ==========================================
// MOCK SERVER FACTORY
// ==========================================

export interface MockServer {
    sockets: {
        sockets: Map<string, MockSocket>;
    };
    to: ReturnType<typeof vi.fn>;
    emit: ReturnType<typeof vi.fn>;
}

export function createMockServer(sockets: MockSocket[] = []): MockServer {
    const socketMap = new Map<string, MockSocket>();
    sockets.forEach(s => socketMap.set(s.id, s));

    const mockEmit = vi.fn();

    return {
        sockets: {
            sockets: socketMap,
        },
        to: vi.fn(() => ({ emit: mockEmit })),
        emit: mockEmit,
    };
}

// ==========================================
// PLAYER FACTORY
// ==========================================

export interface TestPlayer {
    odId: string;
    name: string;
    socketId: string;
    gameType: string;
    joinedAt: Date;
}

export function createTestPlayer(
    id: string,
    gameType: string = 'sequence',
    joinedAt: Date = new Date()
): TestPlayer {
    return {
        odId: `user-${id}`,
        name: `Player ${id}`,
        socketId: `socket-${id}`,
        gameType,
        joinedAt,
    };
}

// ==========================================
// STATE RESET HELPERS
// ==========================================

/**
 * Reset queue service state between tests
 */
export async function resetQueueState(): Promise<void> {
    const queueService = await import('../services/queue.service');
    queueService.stopCleanup();
    // Clear all queues by removing all players
    const testPlayerId = 'cleanup-test';
    queueService.removePlayer(testPlayerId);
}

/**
 * Reset room state - rooms use in-memory Map so we need to remove them
 */
export function createRoomCleanup(): string[] {
    return []; // Track room IDs to clean up
}

// ==========================================
// TIME HELPERS
// ==========================================

export function createExpiredDate(minutesAgo: number = 10): Date {
    return new Date(Date.now() - minutesAgo * 60 * 1000);
}

export function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ==========================================
// ASSERTION HELPERS
// ==========================================

export function expectSocketEmit(socket: MockSocket, event: string, data?: unknown): void {
    expect(socket.emit).toHaveBeenCalledWith(event, expect.objectContaining(data || {}));
}

export function expectNoEmit(socket: MockSocket, event: string): void {
    const calls = socket.emit.mock.calls;
    const eventCalls = calls.filter((call: unknown[]) => call[0] === event);
    expect(eventCalls.length).toBe(0);
}
