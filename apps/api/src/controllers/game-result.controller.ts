import { Response, NextFunction } from "express";
import { z } from "zod";
import { gameResultService } from "../services/game-result.service";
import { AuthRequest } from "../middleware/auth.middleware";

const saveResultSchema = z.object({
  gameType: z.enum(["sequence", "chimp", "code"]),
  score: z.number().int().min(0),
  level: z.number().int().min(1),
  duration: z.number().int().min(0),
  mode: z.enum(["local", "arena"]),
});

export const gameResultController = {
  async saveResult(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const result = saveResultSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          error: "Validation failed",
          details: result.error.flatten().fieldErrors,
        });
      }

      const gameResult = await gameResultService.saveResult({
        userId: req.userId,
        ...result.data,
      });

      return res.status(201).json(gameResult);
    } catch (error) {
      next(error);
    }
  },

  async getHistory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const mode = req.query.mode as "local" | "arena" | undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;

      const { results, total } = await gameResultService.getHistory({
        userId: req.userId,
        mode,
        limit,
        offset,
      });

      return res.json({ results, total, limit, offset });
    } catch (error) {
      next(error);
    }
  },

  async getStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const mode = req.query.mode as "local" | "arena" | undefined;
      const stats = await gameResultService.getStats(req.userId, mode);

      return res.json(stats);
    } catch (error) {
      next(error);
    }
  },
};
