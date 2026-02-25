import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { avatarService, AvatarServiceError } from "../services/avatar.service";


export const uploadAvatar = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        if (!req.file) {
            return res.status(400).json({ error: "No image file provided." });
        }

        const avatarUrl = await avatarService.uploadAvatar(
            userId, 
            req.file.buffer, 
            req.file.mimetype
        );

        return res.status(200).json({
            message: "Avatar uploaded successfully.",
            avatarUrl,
        });
    } catch (error) {
        if (error instanceof AvatarServiceError) {
            return res.status(error.statusCode).json({ error: error.message });
        }
        next(error);
    }
};

export const deleteAvatar = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        await avatarService.deleteAvatar(userId);

        return res.status(200).json({
            message: "Avatar removed successfully.",
            avatarUrl: null,
        });
    } catch (error) {
        if (error instanceof AvatarServiceError) {
            return res.status(error.statusCode).json({ error: error.message });
        }
        next(error);
    }
};
