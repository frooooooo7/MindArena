import { Router } from "express";
import { friendController } from "../controllers/friend.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { rateLimitMiddleware } from "../middleware/rate-limit.middleware";

const router = Router();

router.use(authMiddleware);

// Read endpoints — moderate rate limit
const readLimiter = rateLimitMiddleware(30, 15_000); // 30 req / 15s
// Search is heavier (ILIKE queries) — stricter limit
const searchLimiter = rateLimitMiddleware(20, 15_000); // 20 req / 15s
// Write endpoints — prevent spam
const writeLimiter = rateLimitMiddleware(10, 15_000); // 10 req / 15s

router.get("/", readLimiter, friendController.getFriends);
router.get("/search", searchLimiter, friendController.searchUsers);
router.get("/requests", readLimiter, friendController.getRequests);
router.post("/requests", writeLimiter, friendController.sendRequest);
router.put("/requests/:id/accept", writeLimiter, friendController.acceptRequest);
router.delete("/requests/:id", writeLimiter, friendController.discardOrCancel);

export default router;
