import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { friendService } from "../services/friend.service";
import { 
  SearchPlayersSchema,
  SendFriendRequestSchema,
} from "@mindarena/shared";

export class FriendController {
  searchUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.userId) return res.status(401).json({ error: "Unauthorized" });
      const parsed = SearchPlayersSchema.safeParse(req.query);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid query parameters", details: parsed.error });
      }
      
      const { query, page, limit } = parsed.data;
      const result = await friendService.searchUsers(query, req.userId, page, limit);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  sendRequest = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.userId) return res.status(401).json({ error: "Unauthorized" });
      const parsed = SendFriendRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid body", details: parsed.error });
      }

      const result = await friendService.sendRequest(req.userId, parsed.data.targetUserId);
      return res.status(201).json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return res.status(400).json({ error: message });
    }
  };

  acceptRequest = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.userId) return res.status(401).json({ error: "Unauthorized" });
      const { id } = req.params;
      const result = await friendService.acceptRequest(req.userId, id);
      return res.status(200).json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return res.status(400).json({ error: message });
    }
  };

  discardOrCancel = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.userId) return res.status(401).json({ error: "Unauthorized" });
      const { id } = req.params;
      await friendService.declineOrCancelRequest(req.userId, id);
      return res.status(200).json({ message: "Success" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return res.status(400).json({ error: message });
    }
  };

  getFriends = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.userId) return res.status(401).json({ error: "Unauthorized" });
      const friends = await friendService.getFriendsList(req.userId);
      return res.status(200).json(friends);
    } catch (error) {
      next(error);
    }
  };

  getRequests = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.userId) return res.status(401).json({ error: "Unauthorized" });
      const requests = await friendService.getPendingRequests(req.userId);
      return res.status(200).json(requests);
    } catch (error) {
      next(error);
    }
  };
}

export const friendController = new FriendController();
