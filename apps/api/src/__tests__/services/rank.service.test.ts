/**
 * Rank Service Tests
 * Tests for processMatchRanks which handles ELO persistence
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the repository before importing the service
vi.mock('../../repositories/user.repository', () => ({
  userRepository: {
    findById: vi.fn(),
    updateRank: vi.fn(),
  },
}));

import { processMatchRanks } from '../../services/rank.service';
import { userRepository } from '../../repositories/user.repository';

const mockFindById = vi.mocked(userRepository.findById);
const mockUpdateRank = vi.mocked(userRepository.updateRank);

// Helper to create a mock user
function createMockUser(id: string, name: string, rankPoints: number, rankName = 'Neuron') {
  return {
    id,
    name,
    email: `${name.toLowerCase()}@test.com`,
    passwordHash: 'hashed',
    createdAt: new Date(),
    updatedAt: new Date(),
    rankPoints,
    rankName,
  };
}

describe('Rank Service - processMatchRanks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ==========================================
  // HAPPY PATH
  // ==========================================

  it('should process rank changes for both players', async () => {
    const winner = createMockUser('winner-1', 'Alice', 50);
    const loser = createMockUser('loser-1', 'Bob', 50);

    mockFindById.mockResolvedValueOnce(winner).mockResolvedValueOnce(loser);
    mockUpdateRank.mockResolvedValue({} as any);

    const result = await processMatchRanks('winner-1', 'loser-1');

    expect(result).not.toBeNull();
    expect(result!.winnerId).toBe('winner-1');
    expect(result!.loserId).toBe('loser-1');
  });

  it('should increase winner points and decrease loser points', async () => {
    const winner = createMockUser('winner-1', 'Alice', 50);
    const loser = createMockUser('loser-1', 'Bob', 50);

    mockFindById.mockResolvedValueOnce(winner).mockResolvedValueOnce(loser);
    mockUpdateRank.mockResolvedValue({} as any);

    const result = await processMatchRanks('winner-1', 'loser-1');

    expect(result!.winnerRank.newPoints).toBeGreaterThan(result!.winnerRank.oldPoints);
    expect(result!.loserRank.newPoints).toBeLessThan(result!.loserRank.oldPoints);
  });

  it('should persist new rank data for both players', async () => {
    const winner = createMockUser('winner-1', 'Alice', 96); // Will promote to Synapsa
    const loser = createMockUser('loser-1', 'Bob', 50);

    mockFindById.mockResolvedValueOnce(winner).mockResolvedValueOnce(loser);
    mockUpdateRank.mockResolvedValue({} as any);

    await processMatchRanks('winner-1', 'loser-1');

    // Check updateRank was called for both players
    expect(mockUpdateRank).toHaveBeenCalledTimes(2);

    // Winner should be updated with new points and rank name
    expect(mockUpdateRank).toHaveBeenCalledWith(
      'winner-1',
      expect.any(Number),
      expect.any(String),
    );

    // Loser should be updated
    expect(mockUpdateRank).toHaveBeenCalledWith(
      'loser-1',
      expect.any(Number),
      expect.any(String),
    );
  });

  it('should correctly calculate promotion for winner', async () => {
    const winner = createMockUser('winner-1', 'Alice', 96, 'Neuron');
    const loser = createMockUser('loser-1', 'Bob', 200, 'Synapsa');

    mockFindById.mockResolvedValueOnce(winner).mockResolvedValueOnce(loser);
    mockUpdateRank.mockResolvedValue({} as any);

    const result = await processMatchRanks('winner-1', 'loser-1');

    expect(result!.winnerRank.isPromotion).toBe(true);
    expect(result!.winnerRank.newRankName).toBe('Synapsa');
  });

  // ==========================================
  // ERROR SCENARIOS
  // ==========================================

  it('should return null when winner not found', async () => {
    mockFindById.mockResolvedValueOnce(null).mockResolvedValueOnce(createMockUser('loser-1', 'Bob', 50));

    const result = await processMatchRanks('not-found', 'loser-1');

    expect(result).toBeNull();
    expect(mockUpdateRank).not.toHaveBeenCalled();
  });

  it('should return null when loser not found', async () => {
    mockFindById.mockResolvedValueOnce(createMockUser('winner-1', 'Alice', 50)).mockResolvedValueOnce(null);

    const result = await processMatchRanks('winner-1', 'not-found');

    expect(result).toBeNull();
    expect(mockUpdateRank).not.toHaveBeenCalled();
  });

  it('should return null when both players not found', async () => {
    mockFindById.mockResolvedValueOnce(null).mockResolvedValueOnce(null);

    const result = await processMatchRanks('not-found-1', 'not-found-2');

    expect(result).toBeNull();
  });

  it('should return null and not crash when database update fails', async () => {
    const winner = createMockUser('winner-1', 'Alice', 50);
    const loser = createMockUser('loser-1', 'Bob', 50);

    mockFindById.mockResolvedValueOnce(winner).mockResolvedValueOnce(loser);
    mockUpdateRank.mockRejectedValue(new Error('DB connection failed'));

    const result = await processMatchRanks('winner-1', 'loser-1');

    expect(result).toBeNull();
  });

  // ==========================================
  // EDGE CASES
  // ==========================================

  it('should handle loser at 0 points without going negative', async () => {
    const winner = createMockUser('winner-1', 'Alice', 50);
    const loser = createMockUser('loser-1', 'Bob', 0, 'Neuron');

    mockFindById.mockResolvedValueOnce(winner).mockResolvedValueOnce(loser);
    mockUpdateRank.mockResolvedValue({} as any);

    const result = await processMatchRanks('winner-1', 'loser-1');

    expect(result!.loserRank.newPoints).toBe(0);
    expect(result!.loserRank.pointsDelta).toBe(0);
  });

  it('should fetch both users in parallel using Promise.all', async () => {
    const winner = createMockUser('winner-1', 'Alice', 50);
    const loser = createMockUser('loser-1', 'Bob', 50);

    // Track call order
    mockFindById
      .mockImplementation(async (id: string) => {
        if (id === 'winner-1') return winner;
        if (id === 'loser-1') return loser;
        return null;
      });
    mockUpdateRank.mockResolvedValue({} as any);

    await processMatchRanks('winner-1', 'loser-1');

    // Both findById calls should have been made
    expect(mockFindById).toHaveBeenCalledWith('winner-1');
    expect(mockFindById).toHaveBeenCalledWith('loser-1');
    expect(mockFindById).toHaveBeenCalledTimes(2);
  });
});
