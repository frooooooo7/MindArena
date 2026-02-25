import { Router } from "express";
import { updateUserProfile } from "../controllers/user.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { rateLimitMiddleware } from "../middleware/rate-limit.middleware";

const router = Router();

// 10 profile updates per 60 seconds to prevent abuse
const profileRateLimit = rateLimitMiddleware(10, 60_000);

// PATCH /users/profile - Update user profile data
router.patch("/profile", profileRateLimit, authMiddleware, updateUserProfile);

export default router;

