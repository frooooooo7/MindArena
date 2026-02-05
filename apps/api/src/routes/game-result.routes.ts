import { Router } from "express";
import { gameResultController } from "../controllers/game-result.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

// All routes require authentication
router.use(authMiddleware);

router.post("/", gameResultController.saveResult);
router.get("/", gameResultController.getHistory);
router.get("/stats", gameResultController.getStats);
router.get("/stats-by-game", gameResultController.getStatsByGameType);

export default router;
