import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../repositories/user.repository', () => ({
  userRepository: {
    getLeaderboard: vi.fn(),
    getPlayerRank: vi.fn(),
    getTotalActivePlayers: vi.fn(),
    getTotalPlayers: vi.fn(),
  }
}));

vi.mock('../../repositories/game-result.repository', () => ({
  gameResultRepository: {
    getGlobalStats: vi.fn(),
  }
}));

import { statsService } from '../../services/stats.service';
import { userRepository } from '../../repositories/user.repository';
import { gameResultRepository } from '../../repositories/game-result.repository';

const mockGetLeaderboard = vi.mocked(userRepository.getLeaderboard);
const mockGetPlayerRank = vi.mocked(userRepository.getPlayerRank);
const mockGetTotalActivePlayers = vi.mocked(userRepository.getTotalActivePlayers);
const mockGetTotalPlayers = vi.mocked(userRepository.getTotalPlayers);
const mockGetGlobalStats = vi.mocked(gameResultRepository.getGlobalStats);

describe('Stats Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getLeaderboard', () => {
    it('should fetch from repository and map to LeaderboardPlayer DTO', async () => {
      const mockDbPlayers = [
        {
          id: '1',
          name: 'Player One',
          rankPoints: 1500,
          rankName: 'Synapsa',
          _count: { gameResults: 10 }
        },
        {
          id: '2',
          name: 'Player Two',
          rankPoints: 800,
          rankName: 'Neuron',
          _count: { gameResults: 5 }
        }
      ];

      mockGetLeaderboard.mockResolvedValueOnce(mockDbPlayers);

      const result = await statsService.getLeaderboard(50);

      expect(mockGetLeaderboard).toHaveBeenCalledWith(50);
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: '1',
        name: 'Player One',
        rankPoints: 1500,
        rankName: 'Synapsa',
        totalGames: 10
      });
      expect(result[1]).toEqual({
        id: '2',
        name: 'Player Two',
        rankPoints: 800,
        rankName: 'Neuron',
        totalGames: 5
      });
    });
  });

  describe('getOverview', () => {
    it('should aggregate data from multiple repositories accurately', async () => {
      mockGetPlayerRank.mockResolvedValueOnce(42);
      mockGetTotalActivePlayers.mockResolvedValueOnce(500);
      mockGetTotalPlayers.mockResolvedValueOnce(1200);
      mockGetGlobalStats.mockResolvedValueOnce({
        highestLevel: 15,
        averageScore: 3500
      });

      const result = await statsService.getOverview('uid-123');

      expect(mockGetPlayerRank).toHaveBeenCalledWith('uid-123');
      expect(mockGetTotalActivePlayers).toHaveBeenCalledWith();
      expect(mockGetTotalPlayers).toHaveBeenCalledWith();
      expect(mockGetGlobalStats).toHaveBeenCalledWith();

      expect(result).toEqual({
        globalRank: 42,
        totalActivePlayers: 500,
        totalPlayers: 1200,
        highestLevel: 15,
        averageScore: 3500
      });
    });

    it('should handle null globalRank as 0', async () => {
      mockGetPlayerRank.mockResolvedValueOnce(null);
      mockGetTotalActivePlayers.mockResolvedValueOnce(1);
      mockGetTotalPlayers.mockResolvedValueOnce(1);
      mockGetGlobalStats.mockResolvedValueOnce({
        highestLevel: 1,
        averageScore: 0
      });

      const result = await statsService.getOverview('unknown-uid');

      expect(result.globalRank).toBe(0);
    });
  });
});
