import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getUserProfileByName,
  updateProfile,
  UserServiceError,
} from "../../services/user.service";
import { prisma } from "../../lib/prisma";

vi.mock("../../lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe("UserService", () => {
  const mockUserId = "user-123";
  const mockUser = {
    id: mockUserId,
    name: "OldName",
    email: "test@test.com",
    createdAt: new Date(),
    rankPoints: 100,
    rankName: "Neuron",
    avatarUrl: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("updateProfile", () => {
    it("should update the user name when a valid name is provided", async () => {
      vi.mocked(prisma.user.update).mockResolvedValue({
        ...mockUser,
        name: "NewName",
      } as any);

      const result = await updateProfile(mockUserId, { name: "NewName" });

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: mockUserId },
        data: { name: "NewName" },
        select: expect.objectContaining({
          id: true,
          name: true,
          email: true,
          rankPoints: true,
          rankName: true,
          avatarUrl: true,
        }),
      });
      expect(result.name).toBe("NewName");
    });

    it("should return existing user when no fields are provided", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);

      const result = await updateProfile(mockUserId, {});

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUserId },
        select: expect.objectContaining({
          id: true,
          name: true,
        }),
      });
      expect(prisma.user.update).not.toHaveBeenCalled();
      expect(result.name).toBe("OldName");
    });

    it("should return existing user when name is undefined", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);

      const result = await updateProfile(mockUserId, { name: undefined });

      expect(prisma.user.findUnique).toHaveBeenCalled();
      expect(prisma.user.update).not.toHaveBeenCalled();
      expect(result.id).toBe(mockUserId);
    });

    it("should throw UserServiceError 404 when user is not found (empty payload)", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      await expect(updateProfile(mockUserId, {})).rejects.toThrow(
        UserServiceError,
      );
      await expect(updateProfile(mockUserId, {})).rejects.toThrow(
        "User not found",
      );
    });

    it("should propagate Prisma errors on update failure", async () => {
      vi.mocked(prisma.user.update).mockRejectedValue(
        new Error("DB connection failed"),
      );

      await expect(updateProfile(mockUserId, { name: "Test" })).rejects.toThrow(
        "DB connection failed",
      );
    });
  });

  describe("UserServiceError", () => {
    it("should have correct name and default status code", () => {
      const error = new UserServiceError("Something went wrong");
      expect(error.name).toBe("UserServiceError");
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe("Something went wrong");
    });

    it("should accept custom status code", () => {
      const error = new UserServiceError("Not found", 404);
      expect(error.statusCode).toBe(404);
    });
  });

  describe("getUserProfileByName", () => {
    it("should return user profile when name exists", async () => {
      vi.mocked(prisma.user.findFirst).mockResolvedValue(mockUser as any);

      const result = await getUserProfileByName("OldName");

      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: {
          name: {
            equals: "OldName",
            mode: "insensitive",
          },
        },
        orderBy: {
          createdAt: "asc",
        },
        select: expect.objectContaining({
          id: true,
          name: true,
          rankPoints: true,
          rankName: true,
          avatarUrl: true,
        }),
      });
      expect(result.id).toBe(mockUserId);
    });

    it("should trim profile name before querying", async () => {
      vi.mocked(prisma.user.findFirst).mockResolvedValue(mockUser as any);

      await getUserProfileByName("  OldName  ");

      expect(prisma.user.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            name: {
              equals: "OldName",
              mode: "insensitive",
            },
          },
        }),
      );
    });

    it("should throw 400 for empty trimmed name", async () => {
      await expect(getUserProfileByName("   ")).rejects.toThrow(
        UserServiceError,
      );
      await expect(getUserProfileByName("   ")).rejects.toThrow(
        "Invalid profile name",
      );
      expect(prisma.user.findFirst).not.toHaveBeenCalled();
    });

    it("should throw 400 for forbidden wildcard characters", async () => {
      await expect(getUserProfileByName("O%ld_Na\\me")).rejects.toThrow(
        UserServiceError,
      );
      await expect(getUserProfileByName("O%ld_Na\\me")).rejects.toThrow(
        "Invalid profile name",
      );
      expect(prisma.user.findFirst).not.toHaveBeenCalled();
    });

    it("should throw 404 when user is not found", async () => {
      vi.mocked(prisma.user.findFirst).mockResolvedValue(null);

      await expect(getUserProfileByName("missing")).rejects.toThrow(
        UserServiceError,
      );
      await expect(getUserProfileByName("missing")).rejects.toThrow(
        "User not found",
      );
    });
  });
});
