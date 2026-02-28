import { prisma } from "../lib/prisma";
import type { UpdateProfileData } from "@mindarena/shared";

const USER_SELF_SELECT = {
  id: true,
  name: true,
  email: true,
  createdAt: true,
  rankPoints: true,
  rankName: true,
  avatarUrl: true,
} as const;

const USER_PUBLIC_PROFILE_SELECT = {
  id: true,
  name: true,
  createdAt: true,
  rankPoints: true,
  rankName: true,
  avatarUrl: true,
} as const;

function validateProfileName(name: string) {
  const trimmedName = name.trim();

  if (!trimmedName) {
    throw new UserServiceError("Invalid profile name", 400);
  }

  if (/[%_\\]/.test(trimmedName)) {
    throw new UserServiceError("Invalid profile name", 400);
  }

  return trimmedName;
}

/**
 * Updates a user's profile data (currently supports name).
 * Returns the updated user object with public fields only.
 */
export async function updateProfile(userId: string, data: UpdateProfileData) {
  const updatePayload: Record<string, unknown> = {};

  if (data.name !== undefined) {
    updatePayload.name = data.name;
  }

  // Only update if there's something to change
  if (Object.keys(updatePayload).length === 0) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: USER_SELF_SELECT,
    });

    if (!user) {
      throw new UserServiceError("User not found", 404);
    }

    return user;
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updatePayload,
    select: USER_SELF_SELECT,
  });

  return updatedUser;
}

export async function getUserProfileByName(name: string) {
  const validatedName = validateProfileName(name);

  const user = await prisma.user.findFirst({
    where: {
      name: {
        equals: validatedName,
        mode: "insensitive",
      },
    },
    orderBy: {
      createdAt: "asc",
    },
    select: USER_PUBLIC_PROFILE_SELECT,
  });

  if (!user) {
    throw new UserServiceError("User not found", 404);
  }

  return user;
}

export class UserServiceError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400,
  ) {
    super(message);
    this.name = "UserServiceError";
  }
}
