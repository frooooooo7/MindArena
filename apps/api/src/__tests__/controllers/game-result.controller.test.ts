import { describe, it, expect, vi, beforeEach } from "vitest";
import { Response, NextFunction } from "express";
import { AuthRequest } from "../../middleware/auth.middleware";

vi.mock("../../services/game-result.service", () => ({
  gameResultService: {
    getStats: vi.fn(),
  },
}));

vi.mock("../../services/user.service", () => ({
  getUserProfileByName: vi.fn(),
  UserServiceError: class UserServiceError extends Error {
    statusCode: number;

    constructor(message: string, statusCode = 400) {
      super(message);
      this.statusCode = statusCode;
    }
  },
}));

import { gameResultController } from "../../controllers/game-result.controller";
import { gameResultService } from "../../services/game-result.service";
import {
  getUserProfileByName,
  UserServiceError,
} from "../../services/user.service";

const mockGetStats = vi.mocked(gameResultService.getStats);
const mockGetUserProfileByName = vi.mocked(getUserProfileByName);

describe("Game Result Controller", () => {
  let mockReq: Partial<AuthRequest>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    vi.clearAllMocks();

    mockReq = {
      userId: "request-user",
      query: {},
    };

    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    mockNext = vi.fn();
  });

  describe("getStats", () => {
    it("should return 401 when request is unauthorized", async () => {
      mockReq.userId = undefined;

      await gameResultController.getStats(
        mockReq as AuthRequest,
        mockRes as Response,
        mockNext,
      );

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: "Unauthorized" });
    });

    it("should resolve target user by userName and return stats", async () => {
      const stats = {
        totalGames: 10,
        averageScore: 100,
        bestScore: 300,
        highestLevel: 8,
        totalPlayTime: 500,
      };
      mockReq.query = { userName: "messi", mode: "arena" };
      mockGetUserProfileByName.mockResolvedValue({
        id: "target-user-id",
      } as never);
      mockGetStats.mockResolvedValue(stats as never);

      await gameResultController.getStats(
        mockReq as AuthRequest,
        mockRes as Response,
        mockNext,
      );

      expect(mockGetUserProfileByName).toHaveBeenCalledWith("messi");
      expect(mockGetStats).toHaveBeenCalledWith("target-user-id", "arena");
      expect(mockRes.json).toHaveBeenCalledWith(stats);
    });

    it("should map UserServiceError from profile resolution", async () => {
      mockReq.query = { userName: "unknown" };
      mockGetUserProfileByName.mockRejectedValue(
        new UserServiceError("User not found", 404),
      );

      await gameResultController.getStats(
        mockReq as AuthRequest,
        mockRes as Response,
        mockNext,
      );

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: "User not found" });
      expect(mockGetStats).not.toHaveBeenCalled();
    });
  });
});
