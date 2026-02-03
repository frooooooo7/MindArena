/**
 * Chimp Memory Service Tests
 * Unit tests for chimp memory game logic
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as chimpMemory from '../../../services/games/chimp-memory.service';
import * as roomService from '../../../services/room.service';

// Mock room service
vi.mock('../../../services/room.service', () => ({
    getRoom: vi.fn(),
    getPlayer: vi.fn(),
    updatePlayer: vi.fn(),
    createRoom: vi.fn(),
    updateRoomGameData: vi.fn(),
    resetPlayersProgress: vi.fn(),
    areBothPlayersComplete: vi.fn(),
}));

describe('Chimp Memory Service', () => {
    const roomId = 'test-room';

    beforeEach(() => {
        vi.clearAllMocks();
        chimpMemory.cleanupRoom(roomId);
    });

    // ==========================================
    // GENERATE CELLS
    // ==========================================

    describe('generateCells', () => {
        it('should generate requested number of cells', () => {
            const count = 5;
            const cells = chimpMemory.generateCells(count);

            const numberedCells = cells.filter(c => c.number !== null);
            expect(numberedCells).toHaveLength(count);
            expect(cells).toHaveLength(40);
        });

        it('should generate cells with unique positions', () => {
            const count = 10;
            const cells = chimpMemory.generateCells(count);
            const numberedCells = cells.filter(c => c.number !== null);
            const positions = new Set(numberedCells.map(c => c.id));

            expect(positions.size).toBe(count);
        });

        it('should assign correct numbers 1..N', () => {
            const count = 7;
            const cells = chimpMemory.generateCells(count);
            const numberedCells = cells.filter(c => c.number !== null);
            const numbers = numberedCells.map(c => c.number as number).sort((a, b) => a - b);

            expect(numbers).toEqual([1, 2, 3, 4, 5, 6, 7]);
        });
    });

    // ==========================================
    // PROCESS MOVE
    // ==========================================

    describe('processMove', () => {
        const playerId = 'user-1';

        beforeEach(() => {
            const p1 = { id: 'user-1', name: 'P1', socketId: 's1' };
            const p2 = { id: 'user-2', name: 'P2', socketId: 's2' };

            vi.mocked(roomService.createRoom).mockReturnValue({ id: roomId } as any);
            chimpMemory.createGameRoom(roomId, p1, p2);
        });

        it('should return incorrect if room not found', () => {
            vi.mocked(roomService.getRoom).mockReturnValue(undefined);
            const result = chimpMemory.processMove(roomId, playerId, 0);
            expect(result.correct).toBe(false);
        });

        it('should validate correct move and advance number', () => {
            const data = chimpMemory.getChimpRoomData(roomId);
            const numberedCells = data!.cells.filter(c => c.number !== null);
            const firstCell = numberedCells.find(c => c.number === 1)!;

            vi.mocked(roomService.getRoom).mockReturnValue({ id: roomId, level: 1 } as any);
            vi.mocked(roomService.getPlayer).mockReturnValue({
                id: playerId,
                currentLevel: 1,
                currentIndex: 0
            } as any);

            const result = chimpMemory.processMove(roomId, playerId, firstCell.id);

            expect(result.correct).toBe(true);
            expect(result.completedNumber).toBe(1);
            expect(roomService.updatePlayer).toHaveBeenCalled();
        });

        it('should identify when all numbers are completed', () => {
            vi.mocked(roomService.getRoom).mockReturnValue({ id: roomId, level: 1 } as any);

            const data = chimpMemory.getChimpRoomData(roomId);
            const numberedCells = data!.cells.filter(c => c.number !== null);

            vi.mocked(roomService.getPlayer).mockImplementation((rid, pid) => ({
                id: pid,
                currentIndex: 0
            } as any));

            const sortedCells = [...numberedCells].sort((a, b) => (a.number || 0) - (b.number || 0));

            // Move through all but last
            for (let i = 0; i < sortedCells.length - 1; i++) {
                chimpMemory.processMove(roomId, playerId, sortedCells[i].id);
            }

            // Move for last cell
            const lastCell = sortedCells[sortedCells.length - 1];
            const result = chimpMemory.processMove(roomId, playerId, lastCell.id);

            expect(result.correct).toBe(true);
            expect(result.allCompleted).toBe(true);
        });

        it('should mark failed on wrong move', () => {
            vi.mocked(roomService.getRoom).mockReturnValue({ id: roomId, level: 1 } as any);
            vi.mocked(roomService.getPlayer).mockReturnValue({ id: playerId } as any);

            const data = chimpMemory.getChimpRoomData(roomId);
            const numberedCells = data!.cells.filter(c => c.number !== null);
            // Find a cell that is NOT number 1 (since nextNumber is 1)
            const wrongCell = numberedCells.find(c => c.number !== 1)!;

            const result = chimpMemory.processMove(roomId, playerId, wrongCell.id);

            expect(result.correct).toBe(false);
            expect(roomService.updatePlayer).toHaveBeenCalledWith(roomId, playerId, { hasFailed: true });
        });
    });

    // ==========================================
    // ADVANCE NEXT LEVEL
    // ==========================================

    describe('advanceToNextLevel', () => {
        it('should increase level and number count', () => {
            const p1 = { id: 'user-1', name: 'P1', socketId: 's1' };
            const p2 = { id: 'user-2', name: 'P2', socketId: 's2' };

            vi.mocked(roomService.createRoom).mockReturnValue({ id: roomId, level: 1 } as any);
            chimpMemory.createGameRoom(roomId, p1, p2);

            vi.mocked(roomService.getRoom).mockReturnValue({ id: roomId, level: 1 } as any);

            const result = chimpMemory.advanceToNextLevel(roomId);

            expect(result?.numbersCount).toBe(5); // 4 + (2-1)
            expect(roomService.updateRoomGameData).toHaveBeenCalledWith(roomId, { level: 2 });
        });
    });
});
