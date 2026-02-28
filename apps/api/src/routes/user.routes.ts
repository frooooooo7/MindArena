import { Router } from "express";
import {
  getPublicUserProfileByName,
  updateUserProfile,
} from "../controllers/user.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { rateLimitMiddleware } from "../middleware/rate-limit.middleware";

const router = Router();

// 10 profile updates per 60 seconds to prevent abuse
const profileRateLimit = rateLimitMiddleware(10, 60_000);

// PATCH /users/profile - Update user profile data
router.patch("/profile", profileRateLimit, authMiddleware, updateUserProfile);

// GET /users/profile/:name - Get public profile by name
router.get("/profile/:name", authMiddleware, getPublicUserProfileByName);

export default router;
