import { Response, NextFunction } from "express";
import { gameResultService } from "../services/game-result.service";
import { AuthRequest } from "../middleware/auth.middleware";
import { GameMode, saveGameResultSchema } from "@mindarena/shared";
import {
  getUserProfileByName,
  UserServiceError,
} from "../services/user.service";

async function resolveTargetUserId(requestUserId: string, userName?: string) {
  if (!userName) {
    return requestUserId;
  }

  const user = await getUserProfileByName(userName);
  return user.id;
}

export const gameResultController = {
  async saveResult(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const result = saveGameResultSchema.safeParse(req.body);
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

      const mode = req.query.mode as GameMode | undefined;
      const userName =
        typeof req.query.userName === "string" ? req.query.userName : undefined;
      const limit = req.query.limit
        ? parseInt(req.query.limit as string, 10)
        : 20;
      const offset = req.query.offset
        ? parseInt(req.query.offset as string, 10)
        : 0;
      const targetUserId = await resolveTargetUserId(req.userId, userName);

      const { results, total } = await gameResultService.getHistory({
        userId: targetUserId,
        mode,
        limit,
        offset,
      });

      return res.json({ results, total, limit, offset });
    } catch (error) {
      if (error instanceof UserServiceError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      next(error);
    }
  },

  async getStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const mode = req.query.mode as GameMode | undefined;
      const userName =
        typeof req.query.userName === "string" ? req.query.userName : undefined;
      const targetUserId = await resolveTargetUserId(req.userId, userName);
      const stats = await gameResultService.getStats(targetUserId, mode);

      return res.json(stats);
    } catch (error) {
      if (error instanceof UserServiceError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      next(error);
    }
  },

  async getStatsByGameType(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const mode = req.query.mode as GameMode | undefined;
      const userName =
        typeof req.query.userName === "string" ? req.query.userName : undefined;
      const targetUserId = await resolveTargetUserId(req.userId, userName);
      const stats = await gameResultService.getStatsByGameType(
        targetUserId,
        mode,
      );

      return res.json(stats);
    } catch (error) {
      if (error instanceof UserServiceError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      next(error);
    }
  },
};
