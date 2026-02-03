/**
 * Sequence Memory Service Tests
 * Unit tests for sequence memory game logic
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as sequenceMemory from '../../../services/games/sequence-memory.service';
import * as roomService from '../../../services/room.service';

// Mock room service to isolate game logic
vi.mock('../../../services/room.service', () => ({
    getRoom: vi.fn(),
    getPlayer: vi.fn(),
    updatePlayer: vi.fn(),
    updateRoomGameData: vi.fn(),
    resetPlayersProgress: vi.fn(),
    areBothPlayersComplete: vi.fn(),
}));

describe('Sequence Memory Service', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    // ==========================================
    // GENERATE SEQUENCE
    // ==========================================

    describe('generateSequence', () => {
        it('should generate sequence with length equal to level', () => {
            const level = 3;
            const { sequence, gridSize } = sequenceMemory.generateSequence(level);

            expect(sequence).toHaveLength(level);
            expect(gridSize).toBeDefined();
        });

        it('should generate sequence within grid bounds', () => {
            const level = 5;
            const { sequence, gridSize } = sequenceMemory.generateSequence(level);
            const maxCell = gridSize * gridSize;

            sequence.forEach(cell => {
                expect(cell).toBeGreaterThanOrEqual(0);
                expect(cell).toBeLessThan(maxCell);
            });
        });

        it('should use appropriate grid size for level', () => {
            const level1 = 1;
            const level10 = 10;

            const res1 = sequenceMemory.generateSequence(level1);
            const res10 = sequenceMemory.generateSequence(level10);

            expect(res10.gridSize).toBeGreaterThanOrEqual(res1.gridSize);
        });
    });

    // ==========================================
    // PROCESS MOVE
    // ==========================================

    describe('processMove', () => {
        const roomId = 'test-room';
        const playerId = 'user-1';

        it('should return incorrect if room not found', () => {
            vi.mocked(roomService.getRoom).mockReturnValue(undefined);

            const result = sequenceMemory.processMove(roomId, playerId, 0);
            expect(result.correct).toBe(false);
        });

        it('should return correct and advance index for right move', () => {
            const mockRoom = {
                sequence: [4, 8, 2],
                id: roomId
            } as any;
            const mockPlayer = {
                id: playerId,
                currentIndex: 0
            } as any;

            vi.mocked(roomService.getRoom).mockReturnValue(mockRoom);
            vi.mocked(roomService.getPlayer).mockReturnValue(mockPlayer);

            const result = sequenceMemory.processMove(roomId, playerId, 4);

            expect(result.correct).toBe(true);
            expect(result.sequenceComplete).toBe(false);
            expect(roomService.updatePlayer).toHaveBeenCalledWith(roomId, playerId, { currentIndex: 1 });
        });

        it('should identify sequence completion', () => {
            const mockRoom = {
                sequence: [4],
                id: roomId
            } as any;
            const mockPlayer = {
                id: playerId,
                currentIndex: 0
            } as any;

            vi.mocked(roomService.getRoom).mockReturnValue(mockRoom);
            vi.mocked(roomService.getPlayer).mockReturnValue(mockPlayer);

            const result = sequenceMemory.processMove(roomId, playerId, 4);

            expect(result.correct).toBe(true);
            expect(result.sequenceComplete).toBe(true);
        });

        it('should mark player as failed on wrong move', () => {
            const mockRoom = {
                sequence: [4, 8],
                id: roomId
            } as any;
            const mockPlayer = {
                id: playerId,
                currentIndex: 0
            } as any;

            vi.mocked(roomService.getRoom).mockReturnValue(mockRoom);
            vi.mocked(roomService.getPlayer).mockReturnValue(mockPlayer);

            const result = sequenceMemory.processMove(roomId, playerId, 0); // Wrong cell

            expect(result.correct).toBe(false);
            expect(roomService.updatePlayer).toHaveBeenCalledWith(roomId, playerId, { hasFailed: true });
        });
    });

    // ==========================================
    // ADVANCE NEXT LEVEL
    // ==========================================

    describe('advanceToNextLevel', () => {
        const roomId = 'test-room';

        it('should advance level and generate new sequence', () => {
            const mockRoom = {
                id: roomId,
                level: 2
            } as any;

            vi.mocked(roomService.getRoom).mockReturnValue(mockRoom);
            vi.mocked(roomService.getRoom).mockReturnValue(mockRoom);

            const nextRoom = sequenceMemory.advanceToNextLevel(roomId);

            expect(roomService.updateRoomGameData).toHaveBeenCalledWith(roomId, expect.objectContaining({
                level: 3,
                sequence: expect.any(Array)
            }));
            expect(roomService.resetPlayersProgress).toHaveBeenCalledWith(roomId);
        });
    });
});
