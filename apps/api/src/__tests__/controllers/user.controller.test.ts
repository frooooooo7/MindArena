import { describe, it, expect, vi, beforeEach } from "vitest";
import { Response, NextFunction } from "express";
import { AuthRequest } from "../../middleware/auth.middleware";

vi.mock("../../services/user.service", () => ({
  getUserProfileByName: vi.fn(),
  updateProfile: vi.fn(),
  UserServiceError: class UserServiceError extends Error {
    statusCode: number;

    constructor(message: string, statusCode = 400) {
      super(message);
      this.statusCode = statusCode;
    }
  },
}));

import { getPublicUserProfileByName } from "../../controllers/user.controller";
import {
  getUserProfileByName,
  UserServiceError,
} from "../../services/user.service";

const mockGetUserProfileByName = vi.mocked(getUserProfileByName);

describe("User Controller", () => {
  let mockReq: Partial<AuthRequest>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    vi.clearAllMocks();

    mockReq = {
      userId: "request-user-id",
      params: {},
    };

    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    mockNext = vi.fn();
  });

  describe("getPublicUserProfileByName", () => {
    it("should return 401 when request is unauthorized", async () => {
      mockReq.userId = undefined;

      await getPublicUserProfileByName(
        mockReq as AuthRequest,
        mockRes as Response,
        mockNext,
      );

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: "Unauthorized" });
      expect(mockGetUserProfileByName).not.toHaveBeenCalled();
    });

    it("should return 400 for invalid profile name param", async () => {
      mockReq.params = { name: "" };

      await getPublicUserProfileByName(
        mockReq as AuthRequest,
        mockRes as Response,
        mockNext,
      );

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Invalid profile name",
      });
      expect(mockGetUserProfileByName).not.toHaveBeenCalled();
    });

    it("should return 200 with public profile for valid name", async () => {
      const profile = {
        id: "target-id",
        name: "Messi",
        createdAt: new Date(),
        rankPoints: 1200,
        rankName: "Synapsa",
        avatarUrl: null,
      };

      mockReq.params = { name: "Messi" };
      mockGetUserProfileByName.mockResolvedValue(profile as never);

      await getPublicUserProfileByName(
        mockReq as AuthRequest,
        mockRes as Response,
        mockNext,
      );

      expect(mockGetUserProfileByName).toHaveBeenCalledWith("Messi");
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(profile);
    });

    it("should map UserServiceError status and message", async () => {
      mockReq.params = { name: "Missing" };
      const error = new UserServiceError("User not found", 404);
      mockGetUserProfileByName.mockRejectedValue(error);

      await getPublicUserProfileByName(
        mockReq as AuthRequest,
        mockRes as Response,
        mockNext,
      );

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: "User not found" });
    });
  });
});
