import { Router } from "express";
import { friendController } from "../controllers/friend.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.get("/", friendController.getFriends);
router.get("/search", friendController.searchUsers);
router.get("/requests", friendController.getRequests);
router.post("/requests", friendController.sendRequest);
router.put("/requests/:id/accept", friendController.acceptRequest);
router.delete("/requests/:id", friendController.discardOrCancel);

export default router;
