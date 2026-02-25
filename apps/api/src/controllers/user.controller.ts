import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { updateProfileSchema } from "@mindarena/shared";
import { updateProfile, UserServiceError } from "../services/user.service";

/**
 * PATCH /users/profile
 * Updates user profile data (currently: nickname).
 */
export const updateUserProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const parseResult = updateProfileSchema.safeParse(req.body);
        if (!parseResult.success) {
            const firstError = parseResult.error.errors[0];
            return res.status(400).json({
                error: firstError?.message || "Invalid input",
            });
        }

        const updatedUser = await updateProfile(userId, parseResult.data);

        return res.status(200).json({
            message: "Profile updated successfully.",
            user: updatedUser,
        });
    } catch (error) {
        if (error instanceof UserServiceError) {
            return res.status(error.statusCode).json({ error: error.message });
        }
        next(error);
    }
};
