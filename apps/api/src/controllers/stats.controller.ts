import { Response, NextFunction } from "express";
import { statsService } from "../services/stats.service";
import { AuthRequest } from "../middleware/auth.middleware";
import { z } from "zod";

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(100),
});

export const statsController = {
  async getLeaderboard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const parseResult = querySchema.safeParse(req.query);
      if (!parseResult.success) {
        return res.status(400).json({ error: "Invalid query parameters" });
      }

      const leaderboard = await statsService.getLeaderboard(parseResult.data.limit);

      return res.json(leaderboard);
    } catch (error) {
      next(error);
    }
  },

  async getOverview(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const overview = await statsService.getOverview(req.userId);

      return res.json(overview);
    } catch (error) {
      next(error);
    }
  }
};
