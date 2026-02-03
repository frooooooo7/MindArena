/**
 * Room Service Tests
 * Tests for game room lifecycle management
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as roomService from '../../services/room.service';

describe('Room Service', () => {
    const testRoomId = 'test-room-1';
    const player1 = { id: 'user-1', name: 'Player 1', socketId: 'socket-1' };
    const player2 = { id: 'user-2', name: 'Player 2', socketId: 'socket-2' };
    const initialGameData = { sequence: [1, 5, 9], gridSize: 3 };

    beforeEach(() => {
        // Clean up test rooms
        roomService.removeRoom(testRoomId);
        roomService.removeRoom('test-room-2');
    });

    // ==========================================
    // CREATE ROOM
    // ==========================================

    describe('createRoom', () => {
        it('should create room with correct initial state', () => {
            const room = roomService.createRoom(
                testRoomId,
                'sequence',
                player1,
                player2,
                initialGameData
            );

            expect(room.id).toBe(testRoomId);
            expect(room.gameType).toBe('sequence');
            expect(room.status).toBe('waiting');
            expect(room.players).toHaveLength(2);
            expect(room.sequence).toEqual([1, 5, 9]);
            expect(room.gridSize).toBe(3);
            expect(room.level).toBe(1);
            expect(room.winnerId).toBeNull();
        });

        it('should initialize players with correct properties', () => {
            const room = roomService.createRoom(
                testRoomId,
                'sequence',
                player1,
                player2,
                initialGameData
            );

            const p1 = room.players[0];
            expect(p1.id).toBe('user-1');
            expect(p1.name).toBe('Player 1');
            expect(p1.socketId).toBe('socket-1');
            expect(p1.isReady).toBe(false);
            expect(p1.currentLevel).toBe(1);
            expect(p1.currentIndex).toBe(0);
            expect(p1.hasFailed).toBe(false);
        });
    });

    // ==========================================
    // GET ROOM
    // ==========================================

    describe('getRoom', () => {
        it('should return room when exists', () => {
            roomService.createRoom(testRoomId, 'sequence', player1, player2, initialGameData);

            const room = roomService.getRoom(testRoomId);

            expect(room).toBeDefined();
            expect(room!.id).toBe(testRoomId);
        });

        it('should return undefined when room does not exist', () => {
            const room = roomService.getRoom('non-existent');

            expect(room).toBeUndefined();
        });
    });

    // ==========================================
    // SET PLAYER READY
    // ==========================================

    describe('setPlayerReady', () => {
        it('should mark player as ready', () => {
            roomService.createRoom(testRoomId, 'sequence', player1, player2, initialGameData);

            roomService.setPlayerReady(testRoomId, 'user-1');

            const room = roomService.getRoom(testRoomId);
            const p1 = room!.players.find(p => p.id === 'user-1');
            expect(p1!.isReady).toBe(true);
        });

        it('should return false when only one player ready', () => {
            roomService.createRoom(testRoomId, 'sequence', player1, player2, initialGameData);

            const result = roomService.setPlayerReady(testRoomId, 'user-1');

            expect(result).toBe(false);
        });

        it('should return true when all players ready', () => {
            roomService.createRoom(testRoomId, 'sequence', player1, player2, initialGameData);

            roomService.setPlayerReady(testRoomId, 'user-1');
            const result = roomService.setPlayerReady(testRoomId, 'user-2');

            expect(result).toBe(true);
        });

        it('should return false for non-existent room', () => {
            const result = roomService.setPlayerReady('non-existent', 'user-1');

            expect(result).toBe(false);
        });
    });

    // ==========================================
    // START GAME
    // ==========================================

    describe('startGame', () => {
        it('should change status to playing', () => {
            roomService.createRoom(testRoomId, 'sequence', player1, player2, initialGameData);

            const room = roomService.startGame(testRoomId);

            expect(room!.status).toBe('playing');
        });

        it('should return undefined for non-existent room', () => {
            const room = roomService.startGame('non-existent');

            expect(room).toBeUndefined();
        });
    });

    // ==========================================
    // END GAME
    // ==========================================

    describe('endGame', () => {
        it('should set winner and status to finished', () => {
            roomService.createRoom(testRoomId, 'sequence', player1, player2, initialGameData);
            roomService.startGame(testRoomId);

            const room = roomService.endGame(testRoomId, 'user-1');

            expect(room!.status).toBe('finished');
            expect(room!.winnerId).toBe('user-1');
        });

        it('should return undefined for non-existent room', () => {
            const room = roomService.endGame('non-existent', 'user-1');

            expect(room).toBeUndefined();
        });
    });

    // ==========================================
    // GET OPPONENT
    // ==========================================

    describe('getOpponent', () => {
        it('should return the other player', () => {
            roomService.createRoom(testRoomId, 'sequence', player1, player2, initialGameData);

            const opponent = roomService.getOpponent(testRoomId, 'user-1');

            expect(opponent!.id).toBe('user-2');
            expect(opponent!.name).toBe('Player 2');
        });

        it('should return undefined for non-existent room', () => {
            const opponent = roomService.getOpponent('non-existent', 'user-1');

            expect(opponent).toBeUndefined();
        });
    });

    // ==========================================
    // GET PLAYER
    // ==========================================

    describe('getPlayer', () => {
        it('should return player by ID', () => {
            roomService.createRoom(testRoomId, 'sequence', player1, player2, initialGameData);

            const player = roomService.getPlayer(testRoomId, 'user-1');

            expect(player!.id).toBe('user-1');
            expect(player!.name).toBe('Player 1');
        });

        it('should return undefined for non-existent player', () => {
            roomService.createRoom(testRoomId, 'sequence', player1, player2, initialGameData);

            const player = roomService.getPlayer(testRoomId, 'non-existent');

            expect(player).toBeUndefined();
        });
    });

    // ==========================================
    // UPDATE ROOM GAME DATA
    // ==========================================

    describe('updateRoomGameData', () => {
        it('should update sequence', () => {
            roomService.createRoom(testRoomId, 'sequence', player1, player2, initialGameData);

            roomService.updateRoomGameData(testRoomId, { sequence: [2, 4, 6, 8] });

            const room = roomService.getRoom(testRoomId);
            expect(room!.sequence).toEqual([2, 4, 6, 8]);
        });

        it('should update gridSize', () => {
            roomService.createRoom(testRoomId, 'sequence', player1, player2, initialGameData);

            roomService.updateRoomGameData(testRoomId, { gridSize: 4 });

            const room = roomService.getRoom(testRoomId);
            expect(room!.gridSize).toBe(4);
        });

        it('should update level', () => {
            roomService.createRoom(testRoomId, 'sequence', player1, player2, initialGameData);

            roomService.updateRoomGameData(testRoomId, { level: 5 });

            const room = roomService.getRoom(testRoomId);
            expect(room!.level).toBe(5);
        });

        it('should update multiple properties at once', () => {
            roomService.createRoom(testRoomId, 'sequence', player1, player2, initialGameData);

            roomService.updateRoomGameData(testRoomId, {
                sequence: [1, 2, 3, 4, 5],
                gridSize: 5,
                level: 3,
            });

            const room = roomService.getRoom(testRoomId);
            expect(room!.sequence).toEqual([1, 2, 3, 4, 5]);
            expect(room!.gridSize).toBe(5);
            expect(room!.level).toBe(3);
        });
    });

    // ==========================================
    // RESET PLAYERS PROGRESS
    // ==========================================

    describe('resetPlayersProgress', () => {
        it('should reset currentIndex to 0 for all players', () => {
            roomService.createRoom(testRoomId, 'sequence', player1, player2, initialGameData);
            roomService.updatePlayer(testRoomId, 'user-1', { currentIndex: 5 });
            roomService.updatePlayer(testRoomId, 'user-2', { currentIndex: 3 });

            roomService.resetPlayersProgress(testRoomId);

            const room = roomService.getRoom(testRoomId);
            expect(room!.players[0].currentIndex).toBe(0);
            expect(room!.players[1].currentIndex).toBe(0);
        });

        it('should update currentLevel to room level', () => {
            roomService.createRoom(testRoomId, 'sequence', player1, player2, initialGameData);
            roomService.updateRoomGameData(testRoomId, { level: 5 });

            roomService.resetPlayersProgress(testRoomId);

            const room = roomService.getRoom(testRoomId);
            expect(room!.players[0].currentLevel).toBe(5);
            expect(room!.players[1].currentLevel).toBe(5);
        });
    });

    // ==========================================
    // UPDATE PLAYER
    // ==========================================

    describe('updatePlayer', () => {
        it('should update player currentIndex', () => {
            roomService.createRoom(testRoomId, 'sequence', player1, player2, initialGameData);

            roomService.updatePlayer(testRoomId, 'user-1', { currentIndex: 3 });

            const player = roomService.getPlayer(testRoomId, 'user-1');
            expect(player!.currentIndex).toBe(3);
        });

        it('should update player hasFailed', () => {
            roomService.createRoom(testRoomId, 'sequence', player1, player2, initialGameData);

            roomService.updatePlayer(testRoomId, 'user-1', { hasFailed: true });

            const player = roomService.getPlayer(testRoomId, 'user-1');
            expect(player!.hasFailed).toBe(true);
        });

        it('should return undefined for non-existent player', () => {
            roomService.createRoom(testRoomId, 'sequence', player1, player2, initialGameData);

            const result = roomService.updatePlayer(testRoomId, 'non-existent', { currentIndex: 1 });

            expect(result).toBeUndefined();
        });
    });

    // ==========================================
    // REMOVE ROOM
    // ==========================================

    describe('removeRoom', () => {
        it('should remove room from storage', () => {
            roomService.createRoom(testRoomId, 'sequence', player1, player2, initialGameData);

            roomService.removeRoom(testRoomId);

            expect(roomService.getRoom(testRoomId)).toBeUndefined();
        });

        it('should handle removing non-existent room gracefully', () => {
            expect(() => roomService.removeRoom('non-existent')).not.toThrow();
        });
    });

    // ==========================================
    // GET ROOM STATS
    // ==========================================

    describe('getRoomStats', () => {
        it('should return correct counts by status', () => {
            // Create rooms with different statuses
            roomService.createRoom(testRoomId, 'sequence', player1, player2, initialGameData);
            roomService.createRoom('test-room-2', 'sequence', player1, player2, initialGameData);
            roomService.startGame('test-room-2');

            const stats = roomService.getRoomStats();

            expect(stats.waiting).toBeGreaterThanOrEqual(1);
            expect(stats.playing).toBeGreaterThanOrEqual(1);
        });
    });
});
