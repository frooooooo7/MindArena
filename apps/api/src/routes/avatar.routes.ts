import { Router, Request, Response, NextFunction } from "express";
import { uploadAvatar, deleteAvatar } from "../controllers/avatar.controller";
import { uploadMiddleware } from "../middleware/upload.middleware";
import { authMiddleware } from "../middleware/auth.middleware";
import { rateLimitMiddleware } from "../middleware/rate-limit.middleware";
import multer from "multer";

const router = Router();

// 5 uploads per 120 seconds to prevent abuse
const uploadRateLimit = rateLimitMiddleware(5, 120_000);

// Wrapper to catch multer errors and return JSON
const handleUpload = (req: Request, res: Response, next: NextFunction) => {
    const upload = uploadMiddleware.single("avatar");
    upload(req, res, (err: any) => {
        if (err instanceof multer.MulterError) {
            if (err.code === "LIMIT_FILE_SIZE") {
                return res.status(400).json({ error: "File is too large. Maximum size is 5MB." });
            }
            return res.status(400).json({ error: err.message });
        } else if (err) {
            return res.status(400).json({ error: err.message });
        }
        next();
    });
};

router.post(
    "/avatar",
    uploadRateLimit,  // Limit requests
    authMiddleware,   // Require user login
    handleUpload,     // Handle file upload and multer errors
    uploadAvatar
);

router.delete(
    "/avatar",
    uploadRateLimit,
    authMiddleware,
    deleteAvatar
);

export default router;
