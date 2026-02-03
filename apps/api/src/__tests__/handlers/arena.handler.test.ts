/**
 * Arena Handler Tests
 * Integration tests for matchmaking queue socket events
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { registerArenaHandlers } from '../../sockets/handlers/arena.handler';
import * as queueService from '../../services/queue.service';
import * as rateLimiter from '../../services/rate-limiter.service';
import { createMockServer, createMockSocket, type MockSocket, type MockServer } from '../test-utils';
import { ARENA_EVENTS } from '@mindarena/shared';

describe('Arena Handler', () => {
    let mockSocket: MockSocket;
    let mockServer: MockServer;
    let eventHandlers: Map<string, Function>;

    beforeEach(() => {
        // Reset services
        queueService.stopCleanup();
        queueService.removePlayer('user-1');
        queueService.removePlayer('user-2');

        // Create mock socket with event capturing
        mockSocket = createMockSocket('socket-1', 'user-1', 'Player 1');
        eventHandlers = new Map();
        mockSocket.on = vi.fn((event: string, handler: Function) => {
            eventHandlers.set(event, handler);
        });

        mockServer = createMockServer([mockSocket]);

        // Register handlers
        registerArenaHandlers(
            mockSocket as unknown as import('socket.io').Socket,
            mockServer as unknown as import('socket.io').Server
        );
    });

    afterEach(() => {
        queueService.stopCleanup();
        vi.clearAllMocks();
    });

    // ==========================================
    // JOIN QUEUE
    // ==========================================

    describe('JOIN_QUEUE event', () => {
        it('should register JOIN_QUEUE handler', () => {
            expect(eventHandlers.has(ARENA_EVENTS.JOIN_QUEUE)).toBe(true);
        });

        it('should add player to queue and emit QUEUE_STATUS', () => {
            const joinQueueHandler = eventHandlers.get(ARENA_EVENTS.JOIN_QUEUE)!;

            joinQueueHandler({ gameType: 'sequence' });

            // Player should be in queue
            expect(queueService.getQueueSize('sequence')).toBe(1);

            // Should emit queue status
            expect(mockSocket.emit).toHaveBeenCalledWith(
                ARENA_EVENTS.QUEUE_STATUS,
                expect.objectContaining({
                    position: 1,
                    estimatedWait: 'waiting for opponent',
                })
            );
        });

        it('should emit current position when already in queue', () => {
            const joinQueueHandler = eventHandlers.get(ARENA_EVENTS.JOIN_QUEUE)!;

            // First join
            joinQueueHandler({ gameType: 'sequence' });
            mockSocket.emit.mockClear();

            // Second join attempt
            joinQueueHandler({ gameType: 'sequence' });

            // Should emit position (already in queue)
            expect(mockSocket.emit).toHaveBeenCalledWith(
                ARENA_EVENTS.QUEUE_STATUS,
                expect.objectContaining({
                    position: 1,
                    estimatedWait: 'already in queue',
                })
            );
        });

        it('should attempt match when 2 players in queue', () => {
            // Add second player to queue first
            const player2 = {
                odId: 'user-2',
                name: 'Player 2',
                socketId: 'socket-2',
                gameType: 'sequence',
                joinedAt: new Date(),
            };
            queueService.addPlayer(player2);

            const socket2 = createMockSocket('socket-2', 'user-2', 'Player 2');
            mockServer.sockets.sockets.set('socket-2', socket2);

            const joinQueueHandler = eventHandlers.get(ARENA_EVENTS.JOIN_QUEUE)!;

            // First player joins
            joinQueueHandler({ gameType: 'sequence' });

            // Queue should be empty (both matched)
            expect(queueService.getQueueSize('sequence')).toBe(0);
        });
    });

    // ==========================================
    // LEAVE QUEUE
    // ==========================================

    describe('LEAVE_QUEUE event', () => {
        it('should register LEAVE_QUEUE handler', () => {
            expect(eventHandlers.has(ARENA_EVENTS.LEAVE_QUEUE)).toBe(true);
        });

        it('should remove player from queue', () => {
            // First join
            const joinQueueHandler = eventHandlers.get(ARENA_EVENTS.JOIN_QUEUE)!;
            joinQueueHandler({ gameType: 'sequence' });
            expect(queueService.getQueueSize('sequence')).toBe(1);

            // Then leave
            const leaveQueueHandler = eventHandlers.get(ARENA_EVENTS.LEAVE_QUEUE)!;
            leaveQueueHandler();

            expect(queueService.getQueueSize('sequence')).toBe(0);
        });
    });

    // ==========================================
    // DISCONNECTING
    // ==========================================

    describe('disconnecting event', () => {
        it('should register disconnecting handler', () => {
            expect(eventHandlers.has('disconnecting')).toBe(true);
        });

        it('should remove player from queue on disconnect', () => {
            // First join
            const joinQueueHandler = eventHandlers.get(ARENA_EVENTS.JOIN_QUEUE)!;
            joinQueueHandler({ gameType: 'sequence' });
            expect(queueService.getQueueSize('sequence')).toBe(1);

            // Disconnect
            const disconnectingHandler = eventHandlers.get('disconnecting')!;
            disconnectingHandler();

            expect(queueService.getQueueSize('sequence')).toBe(0);
        });
    });

    // ==========================================
    // RATE LIMITING
    // ==========================================

    describe('rate limiting', () => {
        it('should emit rate limited error when too many requests', () => {
            const joinQueueHandler = eventHandlers.get(ARENA_EVENTS.JOIN_QUEUE)!;

            // Spam requests
            for (let i = 0; i < 20; i++) {
                queueService.removePlayer('user-1'); // Reset to allow rejoining
                joinQueueHandler({ gameType: 'sequence' });
            }

            // At some point rate limiting should kick in
            const rateLimitedCalls = mockSocket.emit.mock.calls.filter(
                (call: unknown[]) =>
                    call[0] === ARENA_EVENTS.QUEUE_STATUS &&
                    (call[1] as Record<string, unknown>)?.error?.toString().includes('Too many')
            );

            expect(rateLimitedCalls.length).toBeGreaterThan(0);
        });
    });
});
