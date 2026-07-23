import { Router } from "express";
import { statsController } from "../controllers/stats.controller";
import { optionalAuthMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.use(optionalAuthMiddleware);

router.get("/leaderboard", statsController.getLeaderboard);
router.get("/overview", statsController.getOverview);

export default router;
