/**
 * Queue Service Tests
 * Tests for player queue management
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as queueService from '../../services/queue.service';
import { createTestPlayer, createExpiredDate, createMockServer, createMockSocket } from '../test-utils';

describe('Queue Service', () => {
    beforeEach(() => {
        // Clear any existing state
        queueService.stopCleanup();
        // Remove test players
        queueService.removePlayer('user-1');
        queueService.removePlayer('user-2');
        queueService.removePlayer('user-3');
    });

    afterEach(() => {
        queueService.stopCleanup();
    });

    // ==========================================
    // ADD PLAYER
    // ==========================================

    describe('addPlayer', () => {
        it('should add player to queue and return true', () => {
            const player = createTestPlayer('1');

            const result = queueService.addPlayer(player);

            expect(result).toBe(true);
            expect(queueService.getQueueSize('sequence')).toBe(1);
        });

        it('should return false when player already in queue', () => {
            const player = createTestPlayer('1');

            queueService.addPlayer(player);
            const result = queueService.addPlayer(player);

            expect(result).toBe(false);
            expect(queueService.getQueueSize('sequence')).toBe(1);
        });

        it('should support multiple game types', () => {
            const player1 = createTestPlayer('1', 'sequence');
            const player2 = createTestPlayer('2', 'chimp');

            queueService.addPlayer(player1);
            queueService.addPlayer(player2);

            expect(queueService.getQueueSize('sequence')).toBe(1);
            expect(queueService.getQueueSize('chimp')).toBe(1);
            expect(queueService.getQueueSize()).toBe(2);
        });
    });

    // ==========================================
    // GET PLAYER POSITION
    // ==========================================

    describe('getPlayerPosition', () => {
        it('should return correct 1-indexed position', () => {
            const player1 = createTestPlayer('1');
            const player2 = createTestPlayer('2');

            queueService.addPlayer(player1);
            queueService.addPlayer(player2);

            expect(queueService.getPlayerPosition('sequence', 'user-1')).toBe(1);
            expect(queueService.getPlayerPosition('sequence', 'user-2')).toBe(2);
        });

        it('should return 0 for player not in queue', () => {
            const result = queueService.getPlayerPosition('sequence', 'non-existent');

            expect(result).toBe(0);
        });
    });

    // ==========================================
    // REMOVE PLAYER
    // ==========================================

    describe('removePlayer', () => {
        it('should remove player from queue', () => {
            const player = createTestPlayer('1');
            queueService.addPlayer(player);

            queueService.removePlayer('user-1');

            expect(queueService.getQueueSize('sequence')).toBe(0);
        });

        it('should handle removing non-existent player gracefully', () => {
            expect(() => queueService.removePlayer('non-existent')).not.toThrow();
        });

        it('should remove player from all game type queues', () => {
            // Same player ID in different queue (shouldn't happen but test robustness)
            const player1 = createTestPlayer('1', 'sequence');
            queueService.addPlayer(player1);

            queueService.removePlayer('user-1');

            expect(queueService.getQueueSize('sequence')).toBe(0);
        });
    });

    // ==========================================
    // TAKE TWO PLAYERS
    // ==========================================

    describe('takeTwoPlayers', () => {
        it('should return null when less than 2 players', () => {
            const player = createTestPlayer('1');
            queueService.addPlayer(player);

            const result = queueService.takeTwoPlayers('sequence');

            expect(result).toBeNull();
        });

        it('should return two players when available', () => {
            const player1 = createTestPlayer('1');
            const player2 = createTestPlayer('2');
            queueService.addPlayer(player1);
            queueService.addPlayer(player2);

            const result = queueService.takeTwoPlayers('sequence');

            expect(result).not.toBeNull();
            expect(result![0].odId).toBe('user-1');
            expect(result![1].odId).toBe('user-2');
        });

        it('should remove taken players from queue', () => {
            const player1 = createTestPlayer('1');
            const player2 = createTestPlayer('2');
            queueService.addPlayer(player1);
            queueService.addPlayer(player2);

            queueService.takeTwoPlayers('sequence');

            expect(queueService.getQueueSize('sequence')).toBe(0);
        });

        it('should take players in FIFO order', () => {
            const player1 = createTestPlayer('1');
            const player2 = createTestPlayer('2');
            const player3 = createTestPlayer('3');
            queueService.addPlayer(player1);
            queueService.addPlayer(player2);
            queueService.addPlayer(player3);

            const result = queueService.takeTwoPlayers('sequence');

            expect(result![0].odId).toBe('user-1');
            expect(result![1].odId).toBe('user-2');
            expect(queueService.getQueueSize('sequence')).toBe(1);
        });
    });

    // ==========================================
    // RETURN TO FRONT
    // ==========================================

    describe('returnToFront', () => {
        it('should place player at front of queue', () => {
            const player1 = createTestPlayer('1');
            const player2 = createTestPlayer('2');
            queueService.addPlayer(player1);

            queueService.returnToFront(player2);

            expect(queueService.getPlayerPosition('sequence', 'user-2')).toBe(1);
            expect(queueService.getPlayerPosition('sequence', 'user-1')).toBe(2);
        });
    });

    // ==========================================
    // QUEUE STATS
    // ==========================================

    describe('getQueueStats', () => {
        it('should return stats for all game types', () => {
            queueService.addPlayer(createTestPlayer('1', 'sequence'));
            queueService.addPlayer(createTestPlayer('2', 'sequence'));
            queueService.addPlayer(createTestPlayer('3', 'chimp'));

            const stats = queueService.getQueueStats();

            expect(stats['sequence']).toBe(2);
            expect(stats['chimp']).toBe(1);
        });
    });

    // ==========================================
    // TIMEOUT CLEANUP
    // ==========================================

    describe('cleanup', () => {
        it('should remove timed out players', async () => {
            vi.useFakeTimers();

            const socket1 = createMockSocket('socket-1');
            const mockServer = createMockServer([socket1]);

            // Add player with old join date (> 5 minutes ago)
            const expiredPlayer = {
                odId: 'user-expired',
                name: 'Expired Player',
                socketId: 'socket-1',
                gameType: 'sequence',
                joinedAt: createExpiredDate(10), // 10 minutes ago
            };
            queueService.addPlayer(expiredPlayer);

            // Start cleanup and advance time
            queueService.startCleanup(mockServer as unknown as import('socket.io').Server);

            // Advance past cleanup interval (30 seconds)
            vi.advanceTimersByTime(31000);

            // Player should be removed
            expect(queueService.getQueueSize('sequence')).toBe(0);

            queueService.stopCleanup();
            vi.useRealTimers();
        });
    });
});
