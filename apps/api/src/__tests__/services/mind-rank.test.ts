/**
 * MindRank System Tests
 * Tests for the pure ELO/ranking functions in @mindarena/shared
 */
import { describe, it, expect } from 'vitest';
import {
  getRankForPoints,
  calculateRankChange,
  getNextRankTier,
  getRankProgress,
  RANK_TIERS,
  RANK_POINTS_PER_MATCH,
  MIN_RANK_POINTS,
} from '@mindarena/shared';

// ============================================
// getRankForPoints
// ============================================

describe('getRankForPoints', () => {
  it('should return Neuron for 0 points', () => {
    const rank = getRankForPoints(0);
    expect(rank.name).toBe('Neuron');
    expect(rank.icon).toBe('🧠');
    expect(rank.minPoints).toBe(0);
  });

  it('should return Neuron for points below Synapsa threshold', () => {
    expect(getRankForPoints(50).name).toBe('Neuron');
    expect(getRankForPoints(99).name).toBe('Neuron');
  });

  it('should return Synapsa at exactly 100 points', () => {
    expect(getRankForPoints(100).name).toBe('Synapsa');
  });

  it('should return Synapsa for points between 100 and 299', () => {
    expect(getRankForPoints(150).name).toBe('Synapsa');
    expect(getRankForPoints(299).name).toBe('Synapsa');
  });

  it('should return Kora at exactly 300 points', () => {
    expect(getRankForPoints(300).name).toBe('Kora');
  });

  it('should return Kora for points between 300 and 599', () => {
    expect(getRankForPoints(450).name).toBe('Kora');
    expect(getRankForPoints(599).name).toBe('Kora');
  });

  it('should return Geniusz at exactly 600 points', () => {
    expect(getRankForPoints(600).name).toBe('Geniusz');
  });

  it('should return Geniusz for any points above 600', () => {
    expect(getRankForPoints(1000).name).toBe('Geniusz');
    expect(getRankForPoints(9999).name).toBe('Geniusz');
  });

  it('should return a fresh copy (no reference to RANK_TIERS)', () => {
    const rank1 = getRankForPoints(0);
    const rank2 = getRankForPoints(0);
    expect(rank1).toEqual(rank2);
    expect(rank1).not.toBe(rank2); // Different object references
  });
});

// ============================================
// calculateRankChange
// ============================================

describe('calculateRankChange', () => {
  describe('winner scenarios', () => {
    it('should add RANK_POINTS_PER_MATCH for a win', () => {
      const result = calculateRankChange(50, true);
      expect(result.oldPoints).toBe(50);
      expect(result.newPoints).toBe(50 + RANK_POINTS_PER_MATCH);
      expect(result.pointsDelta).toBe(RANK_POINTS_PER_MATCH);
    });

    it('should detect promotion when crossing tier boundary', () => {
      // 96 + 8 = 104 → Neuron → Synapsa
      const result = calculateRankChange(96, true);
      expect(result.oldRankName).toBe('Neuron');
      expect(result.newRankName).toBe('Synapsa');
      expect(result.isPromotion).toBe(true);
      expect(result.isDemotion).toBe(false);
    });

    it('should NOT detect promotion when staying in same tier', () => {
      const result = calculateRankChange(50, true);
      expect(result.oldRankName).toBe('Neuron');
      expect(result.newRankName).toBe('Neuron');
      expect(result.isPromotion).toBe(false);
      expect(result.isDemotion).toBe(false);
    });

    it('should set correct icon after promotion', () => {
      const result = calculateRankChange(96, true);
      expect(result.newRankIcon).toBe('⚡'); // Synapsa icon
    });
  });

  describe('loser scenarios', () => {
    it('should subtract RANK_POINTS_PER_MATCH for a loss', () => {
      const result = calculateRankChange(50, false);
      expect(result.oldPoints).toBe(50);
      expect(result.newPoints).toBe(50 - RANK_POINTS_PER_MATCH);
      expect(result.pointsDelta).toBe(-RANK_POINTS_PER_MATCH);
    });

    it('should detect demotion when crossing tier boundary downward', () => {
      // 104 - 8 = 96 → Synapsa → Neuron
      const result = calculateRankChange(104, false);
      expect(result.oldRankName).toBe('Synapsa');
      expect(result.newRankName).toBe('Neuron');
      expect(result.isDemotion).toBe(true);
      expect(result.isPromotion).toBe(false);
    });

    it('should NOT go below MIN_RANK_POINTS (floor at 0)', () => {
      const result = calculateRankChange(3, false);
      expect(result.newPoints).toBe(MIN_RANK_POINTS);
      expect(result.pointsDelta).toBe(-3); // Only lost 3, not 8
    });

    it('should handle 0 points loss gracefully', () => {
      const result = calculateRankChange(0, false);
      expect(result.newPoints).toBe(0);
      expect(result.pointsDelta).toBe(0);
      expect(result.isDemotion).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle win at exactly tier threshold', () => {
      // Win at exactly 100 (Synapsa threshold)
      const result = calculateRankChange(100, true);
      expect(result.oldRankName).toBe('Synapsa');
      expect(result.newRankName).toBe('Synapsa');
      expect(result.isPromotion).toBe(false);
    });

    it('should handle loss at exactly tier threshold', () => {
      // Loss at exactly 100 → drops to 92 → Neuron
      const result = calculateRankChange(100, false);
      expect(result.oldRankName).toBe('Synapsa');
      expect(result.newRankName).toBe('Neuron');
      expect(result.isDemotion).toBe(true);
    });

    it('should handle promotion to Kora', () => {
      // 296 + 8 = 304 → Synapsa → Kora
      const result = calculateRankChange(296, true);
      expect(result.oldRankName).toBe('Synapsa');
      expect(result.newRankName).toBe('Kora');
      expect(result.isPromotion).toBe(true);
      expect(result.newRankIcon).toBe('🌀');
    });

    it('should handle promotion to Geniusz', () => {
      // 596 + 8 = 604 → Kora → Geniusz
      const result = calculateRankChange(596, true);
      expect(result.oldRankName).toBe('Kora');
      expect(result.newRankName).toBe('Geniusz');
      expect(result.isPromotion).toBe(true);
      expect(result.newRankIcon).toBe('🏆');
    });

    it('should handle win at max rank', () => {
      const result = calculateRankChange(1000, true);
      expect(result.newRankName).toBe('Geniusz');
      expect(result.isPromotion).toBe(false);
    });
  });
});

// ============================================
// getNextRankTier
// ============================================

describe('getNextRankTier', () => {
  it('should return Synapsa as next tier for Neuron', () => {
    const next = getNextRankTier('Neuron');
    expect(next).not.toBeNull();
    expect(next!.name).toBe('Synapsa');
    expect(next!.minPoints).toBe(100);
  });

  it('should return Kora as next tier for Synapsa', () => {
    const next = getNextRankTier('Synapsa');
    expect(next).not.toBeNull();
    expect(next!.name).toBe('Kora');
  });

  it('should return Geniusz as next tier for Kora', () => {
    const next = getNextRankTier('Kora');
    expect(next).not.toBeNull();
    expect(next!.name).toBe('Geniusz');
  });

  it('should return null for Geniusz (max rank)', () => {
    const next = getNextRankTier('Geniusz');
    expect(next).toBeNull();
  });

  it('should return a fresh copy (not a reference to RANK_TIERS)', () => {
    const next1 = getNextRankTier('Neuron');
    const next2 = getNextRankTier('Neuron');
    expect(next1).toEqual(next2);
    expect(next1).not.toBe(next2);
  });
});

// ============================================
// getRankProgress
// ============================================

describe('getRankProgress', () => {
  it('should return 0 for 0 points (start of Neuron tier)', () => {
    expect(getRankProgress(0)).toBe(0);
  });

  it('should return 50 for 50 points (halfway through Neuron → Synapsa)', () => {
    // Neuron: 0-99, Synapsa starts at 100
    // 50 / 100 = 50%
    expect(getRankProgress(50)).toBe(50);
  });

  it('should return correct progress within Synapsa tier', () => {
    // Synapsa: 100-299, Kora starts at 300
    // Progress at 200: (200-100) / (300-100) = 100/200 = 50%
    expect(getRankProgress(200)).toBe(50);
  });

  it('should return 0 at start of a new tier', () => {
    // At exactly 100 (Synapsa start): (100-100) / (300-100) = 0%
    expect(getRankProgress(100)).toBe(0);
  });

  it('should return close to 100 just before next tier', () => {
    // At 99 (just before Synapsa): 99/100 = 99%
    expect(getRankProgress(99)).toBe(99);
  });

  it('should return 100 for max rank (Geniusz)', () => {
    expect(getRankProgress(600)).toBe(100);
    expect(getRankProgress(1000)).toBe(100);
  });

  it('should cap at 100 and never exceed', () => {
    expect(getRankProgress(9999)).toBe(100);
  });
});

// ============================================
// RANK_TIERS constant integrity
// ============================================

describe('RANK_TIERS', () => {
  it('should have 4 tiers', () => {
    expect(RANK_TIERS).toHaveLength(4);
  });

  it('should be sorted by minPoints ascending', () => {
    for (let i = 1; i < RANK_TIERS.length; i++) {
      expect(RANK_TIERS[i].minPoints).toBeGreaterThan(RANK_TIERS[i - 1].minPoints);
    }
  });

  it('should start at 0', () => {
    expect(RANK_TIERS[0].minPoints).toBe(0);
  });

  it('should have unique names', () => {
    const names = RANK_TIERS.map((t) => t.name);
    expect(new Set(names).size).toBe(names.length);
  });
});
