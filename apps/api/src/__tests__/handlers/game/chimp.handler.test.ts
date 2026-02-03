/**
 * Chimp Game Handler Tests
 * Integration tests for chimp-specific game events
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleChimpMove, startChimpGame } from '../../../sockets/handlers/game/chimp.handler';
import * as roomService from '../../../services/room.service';
import { chimpMemory } from '../../../services/games';
import { createMockServer, createMockSocket, type MockSocket, type MockServer } from '../../test-utils';
import { GAME_EVENTS } from '@mindarena/shared';

// Mock timer functions
vi.mock('../../../sockets/handlers/game/timer', () => ({
    startRoundTimer: vi.fn(),
    clearRoundTimer: vi.fn(),
}));

describe('Chimp Game Handler', () => {
    let mockSocket: MockSocket;
    let mockServer: MockServer;
    const roomId = 'test-room';
    const playerId = 'user-1';

    beforeEach(() => {
        vi.clearAllMocks();
        mockSocket = createMockSocket('s1', playerId, 'Player 1');
        mockServer = createMockServer([mockSocket]);
    });

    // ==========================================
    // START CHIMP GAME
    // ==========================================

    describe('startChimpGame', () => {
        it('should start game and emit CHIMP_START event', () => {
            const mockRoom = {
                id: roomId,
                level: 1,
                players: [{ id: playerId, name: 'Player 1' }]
            };
            const mockChimpData = {
                cells: [{ cellId: 1, number: 1 }],
                numbersCount: 4
            };

            vi.spyOn(roomService, 'startGame').mockReturnValue(mockRoom as any);
            vi.spyOn(chimpMemory, 'getChimpRoomData').mockReturnValue(mockChimpData as any);

            startChimpGame(mockServer as any, roomId);

            expect(roomService.startGame).toHaveBeenCalledWith(roomId);
            expect(mockServer.to).toHaveBeenCalledWith(roomId);
            expect(mockServer.emit).toHaveBeenCalledWith(GAME_EVENTS.CHIMP_START, expect.objectContaining({
                cells: mockChimpData.cells,
                numbersCount: 4
            }));
        });
    });

    // ==========================================
    // HANDLE CHIMP MOVE
    // ==========================================

    describe('handleChimpMove', () => {
        it('should emit CHIMP_MOVE_RESULT on move', () => {
            const mockRoom = { status: 'playing' };
            vi.spyOn(roomService, 'getRoom').mockReturnValue(mockRoom as any);
            vi.spyOn(chimpMemory, 'processMove').mockReturnValue({
                correct: true,
                completedNumber: 1,
                allCompleted: false,
                player: { id: playerId } as any
            });

            handleChimpMove(mockSocket as any, mockServer as any, roomId, playerId, 10);

            expect(chimpMemory.processMove).toHaveBeenCalledWith(roomId, playerId, 10);
            expect(mockSocket.emit).toHaveBeenCalledWith(GAME_EVENTS.CHIMP_MOVE_RESULT, {
                correct: true,
                completedNumber: 1,
                allCompleted: false
            });
        });

        it('should notify opponent of progress', () => {
            const mockRoom = { status: 'playing', level: 1 };
            vi.spyOn(roomService, 'getRoom').mockReturnValue(mockRoom as any);
            vi.spyOn(chimpMemory, 'processMove').mockReturnValue({
                correct: true,
                completedNumber: 1,
                allCompleted: false,
                player: { id: playerId } as any
            });
            vi.spyOn(roomService, 'getOpponent').mockReturnValue({ socketId: 's2' } as any);
            vi.spyOn(chimpMemory, 'getPlayerProgress').mockReturnValue({ completedCount: 1 } as any);

            handleChimpMove(mockSocket as any, mockServer as any, roomId, playerId, 1);

            expect(mockServer.to).toHaveBeenCalledWith('s2');
            expect(mockServer.emit).toHaveBeenCalledWith(GAME_EVENTS.CHIMP_OPPONENT_PROGRESS, expect.objectContaining({
                playerId,
                completedCount: 1
            }));
        });

        it('should handle level completion', () => {
            const mockRoom = { status: 'playing', level: 1 };
            vi.spyOn(roomService, 'getRoom').mockReturnValue(mockRoom as any);
            vi.spyOn(chimpMemory, 'processMove').mockReturnValue({
                correct: true,
                completedNumber: 4,
                allCompleted: true,
                player: { id: playerId } as any
            });
            // Both players complete
            vi.spyOn(chimpMemory, 'areBothPlayersComplete').mockReturnValue(true);
            vi.spyOn(chimpMemory, 'advanceToNextLevel').mockReturnValue({
                room: { level: 2 },
                cells: [],
                numbersCount: 5
            } as any);

            handleChimpMove(mockSocket as any, mockServer as any, roomId, playerId, 4);

            expect(chimpMemory.advanceToNextLevel).toHaveBeenCalledWith(roomId);
            expect(mockServer.to).toHaveBeenCalledWith(roomId);
            expect(mockServer.emit).toHaveBeenCalledWith(GAME_EVENTS.CHIMP_LEVEL_COMPLETE, expect.objectContaining({
                newLevel: 2
            }));
        });
    });
});
