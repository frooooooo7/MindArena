import { Router } from "express";
import { statsController } from "../controllers/stats.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.get("/leaderboard", statsController.getLeaderboard);
router.get("/overview", statsController.getOverview);

export default router;
