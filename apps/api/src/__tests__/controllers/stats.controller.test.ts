import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';

vi.mock('../../services/stats.service', () => ({
  statsService: {
    getLeaderboard: vi.fn(),
    getOverview: vi.fn()
  }
}));

import { statsController } from '../../controllers/stats.controller';
import { statsService } from '../../services/stats.service';
import { AuthRequest } from '../../middleware/auth.middleware';

const mockGetLeaderboard = vi.mocked(statsService.getLeaderboard);
const mockGetOverview = vi.mocked(statsService.getOverview);

describe('Stats Controller', () => {
  let mockReq: Partial<AuthRequest>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    vi.clearAllMocks();

    mockReq = {
      userId: 'test-user-id',
      query: {}
    };

    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };

    mockNext = vi.fn();
  });

  describe('getLeaderboard', () => {
    it('should return 401 if userId is missing', async () => {
      mockReq.userId = undefined;

      await statsController.getLeaderboard(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    });

    it('should default limit to 100 if not provided', async () => {
      mockGetLeaderboard.mockResolvedValueOnce([]);

      await statsController.getLeaderboard(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockGetLeaderboard).toHaveBeenCalledWith(100);
      expect(mockRes.json).toHaveBeenCalledWith([]);
    });

    it('should pass given valid limit', async () => {
      mockReq.query = { limit: '50' };
      mockGetLeaderboard.mockResolvedValueOnce([]);

      await statsController.getLeaderboard(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockGetLeaderboard).toHaveBeenCalledWith(50);
      expect(mockRes.json).toHaveBeenCalledWith([]);
    });

    it('should return 400 for negative limit', async () => {
      mockReq.query = { limit: '-1' };

      await statsController.getLeaderboard(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid query parameters' });
      expect(mockGetLeaderboard).not.toHaveBeenCalled();
    });

    it('should return 400 for excessive limit', async () => {
      mockReq.query = { limit: '101' };

      await statsController.getLeaderboard(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid query parameters' });
    });

    it('should handle service errors via next function', async () => {
      const error = new Error('Database Error');
      mockGetLeaderboard.mockRejectedValueOnce(error);

      await statsController.getLeaderboard(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getOverview', () => {
    it('should return 401 if userId is missing', async () => {
      mockReq.userId = undefined;

      await statsController.getOverview(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    });

    it('should return 200 with overview data', async () => {
      const overviewData = {
        globalRank: 42,
        totalActivePlayers: 500,
        totalPlayers: 1000,
        highestLevel: 10,
        averageScore: 1200
      };
      
      mockGetOverview.mockResolvedValueOnce(overviewData);

      await statsController.getOverview(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockGetOverview).toHaveBeenCalledWith('test-user-id');
      expect(mockRes.json).toHaveBeenCalledWith(overviewData);
    });

    it('should handle service errors via next function', async () => {
      const error = new Error('Internal Error');
      mockGetOverview.mockRejectedValueOnce(error);

      await statsController.getOverview(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
