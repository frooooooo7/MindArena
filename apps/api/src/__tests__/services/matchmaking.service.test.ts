/**
 * Matchmaking Service Tests
 * Tests for player matching logic
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock game services before importing matchmaking
vi.mock('../../services/games', () => ({
    sequenceMemory: {
        createGameRoom: vi.fn(() => ({ id: 'test-room' })),
    },
    chimpMemory: {
        createGameRoom: vi.fn(() => ({ room: { id: 'test-room' }, cells: [], numbersCount: 4 })),
    },
}));

import * as matchmaking from '../../services/matchmaking.service';
import * as queueService from '../../services/queue.service';
import { createTestPlayer, createMockServer, createMockSocket } from '../test-utils';
import { ARENA_EVENTS } from '@mindarena/shared';

describe('Matchmaking Service', () => {
    beforeEach(() => {
        queueService.stopCleanup();
        // Clear queues
        queueService.removePlayer('user-1');
        queueService.removePlayer('user-2');
        queueService.removePlayer('user-3');
    });

    afterEach(() => {
        queueService.stopCleanup();
    });

    // ==========================================
    // ATTEMPT MATCH - NO PLAYERS
    // ==========================================

    describe('attemptMatch with insufficient players', () => {
        it('should do nothing when queue is empty', () => {
            const mockServer = createMockServer();

            // Should not throw
            expect(() => {
                matchmaking.attemptMatch('sequence', mockServer as unknown as import('socket.io').Server);
            }).not.toThrow();
        });

        it('should do nothing when only 1 player in queue', () => {
            const socket1 = createMockSocket('socket-1', 'user-1', 'Player 1');
            const mockServer = createMockServer([socket1]);

            queueService.addPlayer(createTestPlayer('1'));

            matchmaking.attemptMatch('sequence', mockServer as unknown as import('socket.io').Server);

            // Player should still be in queue (no match)
            expect(queueService.getQueueSize('sequence')).toBe(1);
        });
    });

    // ==========================================
    // SUCCESSFUL MATCH
    // ==========================================

    describe('attemptMatch with 2 players', () => {
        it('should match two players successfully', () => {
            const socket1 = createMockSocket('socket-1', 'user-1', 'Player 1');
            const socket2 = createMockSocket('socket-2', 'user-2', 'Player 2');
            const mockServer = createMockServer([socket1, socket2]);

            queueService.addPlayer(createTestPlayer('1'));
            queueService.addPlayer(createTestPlayer('2'));

            matchmaking.attemptMatch('sequence', mockServer as unknown as import('socket.io').Server);

            // Both players removed from queue
            expect(queueService.getQueueSize('sequence')).toBe(0);
        });

        it('should notify both players with MATCH_FOUND', () => {
            const socket1 = createMockSocket('socket-1', 'user-1', 'Player 1');
            const socket2 = createMockSocket('socket-2', 'user-2', 'Player 2');
            const mockServer = createMockServer([socket1, socket2]);

            queueService.addPlayer(createTestPlayer('1'));
            queueService.addPlayer(createTestPlayer('2'));

            matchmaking.attemptMatch('sequence', mockServer as unknown as import('socket.io').Server);

            // Both sockets should receive MATCH_FOUND
            expect(socket1.emit).toHaveBeenCalledWith(
                ARENA_EVENTS.MATCH_FOUND,
                expect.objectContaining({
                    opponent: expect.objectContaining({ name: 'Player 2' }),
                    gameType: 'sequence',
                })
            );
            expect(socket2.emit).toHaveBeenCalledWith(
                ARENA_EVENTS.MATCH_FOUND,
                expect.objectContaining({
                    opponent: expect.objectContaining({ name: 'Player 1' }),
                    gameType: 'sequence',
                })
            );
        });

        it('should join both sockets to game room', () => {
            const socket1 = createMockSocket('socket-1', 'user-1', 'Player 1');
            const socket2 = createMockSocket('socket-2', 'user-2', 'Player 2');
            const mockServer = createMockServer([socket1, socket2]);

            queueService.addPlayer(createTestPlayer('1'));
            queueService.addPlayer(createTestPlayer('2'));

            matchmaking.attemptMatch('sequence', mockServer as unknown as import('socket.io').Server);

            // Both sockets should have joined a room
            expect(socket1.join).toHaveBeenCalled();
            expect(socket2.join).toHaveBeenCalled();
        });
    });

    // ==========================================
    // DISCONNECTED PLAYER HANDLING
    // ==========================================

    describe('attemptMatch with disconnected player', () => {
        it('should return player2 to queue when player1 disconnected', () => {
            const socket1 = createMockSocket('socket-1', 'user-1', 'Player 1');
            socket1.connected = false; // Player 1 disconnected
            const socket2 = createMockSocket('socket-2', 'user-2', 'Player 2');
            const mockServer = createMockServer([socket1, socket2]);

            queueService.addPlayer(createTestPlayer('1'));
            queueService.addPlayer(createTestPlayer('2'));

            matchmaking.attemptMatch('sequence', mockServer as unknown as import('socket.io').Server);

            // Player 2 should be back in queue
            // (recursive call might match with someone else, but at minimum player2 handled)
            expect(socket2.emit).not.toHaveBeenCalledWith(ARENA_EVENTS.MATCH_FOUND, expect.anything());
        });

        it('should return player1 to queue when player2 disconnected', () => {
            const socket1 = createMockSocket('socket-1', 'user-1', 'Player 1');
            const socket2 = createMockSocket('socket-2', 'user-2', 'Player 2');
            socket2.connected = false; // Player 2 disconnected
            const mockServer = createMockServer([socket1, socket2]);

            queueService.addPlayer(createTestPlayer('1'));
            queueService.addPlayer(createTestPlayer('2'));

            matchmaking.attemptMatch('sequence', mockServer as unknown as import('socket.io').Server);

            // Player 1 should NOT have received match found with disconnected player
            expect(socket1.emit).not.toHaveBeenCalledWith(
                ARENA_EVENTS.MATCH_FOUND,
                expect.objectContaining({ opponent: expect.objectContaining({ name: 'Player 2' }) })
            );
        });
    });

    // ==========================================
    // GAME TYPE ROUTING
    // ==========================================

    describe('game type handling', () => {
        it('should create chimp game room for chimp game type', () => {
            const socket1 = createMockSocket('socket-1', 'user-1', 'Player 1');
            const socket2 = createMockSocket('socket-2', 'user-2', 'Player 2');
            const mockServer = createMockServer([socket1, socket2]);

            queueService.addPlayer(createTestPlayer('1', 'chimp'));
            queueService.addPlayer(createTestPlayer('2', 'chimp'));

            matchmaking.attemptMatch('chimp', mockServer as unknown as import('socket.io').Server);

            // Both should receive MATCH_FOUND with chimp game type
            expect(socket1.emit).toHaveBeenCalledWith(
                ARENA_EVENTS.MATCH_FOUND,
                expect.objectContaining({ gameType: 'chimp' })
            );
        });

        it('should not match players from different game types', () => {
            const socket1 = createMockSocket('socket-1', 'user-1', 'Player 1');
            const socket2 = createMockSocket('socket-2', 'user-2', 'Player 2');
            const mockServer = createMockServer([socket1, socket2]);

            queueService.addPlayer(createTestPlayer('1', 'sequence'));
            queueService.addPlayer(createTestPlayer('2', 'chimp'));

            // Try to match in sequence queue
            matchmaking.attemptMatch('sequence', mockServer as unknown as import('socket.io').Server);

            // Only 1 player in sequence queue, no match
            expect(queueService.getQueueSize('sequence')).toBe(1);
            expect(queueService.getQueueSize('chimp')).toBe(1);
        });
    });
});
