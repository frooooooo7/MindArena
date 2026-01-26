import { Request, Response, NextFunction } from "express";
import { loginSchema, registerSchema } from "@mindarena/shared";
import { authService } from "../services/auth.service";
import { 
    setRefreshTokenCookie, 
    clearRefreshTokenCookie, 
    getRefreshTokenFromCookies 
} from "../utils/cookies";

export const authController = {
    async register(req: Request, res: Response, next: NextFunction) {
        try {
            const result = registerSchema.safeParse(req.body);

            if (!result.success) {
                return res.status(400).json({
                    error: "Validation failed",
                    details: result.error.flatten().fieldErrors,
                });
            }

            const { name, email, password } = result.data;
            const { accessToken, refreshToken, user } = await authService.register({ name, email, password });

            setRefreshTokenCookie(res, refreshToken);

            return res.status(201).json({ accessToken, user });
        } catch (error) {
            next(error);
        }
    },

    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const result = loginSchema.safeParse(req.body);

            if (!result.success) {
                return res.status(400).json({
                    error: "Validation failed",
                    details: result.error.flatten().fieldErrors,
                });
            }

            const { email, password } = result.data;
            const { accessToken, refreshToken, user } = await authService.login({ email, password });

            setRefreshTokenCookie(res, refreshToken);

            return res.json({ accessToken, user });
        } catch (error) {
            next(error);
        }
    },

    async refresh(req: Request, res: Response, next: NextFunction) {
        try {
            const refreshToken = getRefreshTokenFromCookies(req);

            if (!refreshToken) {
                return res.status(401).json({ error: "No refresh token provided" });
            }

            const { accessToken, user } = await authService.refresh(refreshToken);

            return res.json({ accessToken, user });
        } catch (error) {
            clearRefreshTokenCookie(res);
            next(error);
        }
    },

    async logout(req: Request, res: Response, next: NextFunction) {
        try {
            const refreshToken = getRefreshTokenFromCookies(req);

            if (refreshToken) {
                await authService.logout(refreshToken);
            }

            clearRefreshTokenCookie(res);

            return res.json({ message: "Logged out successfully" });
        } catch (error) {
            clearRefreshTokenCookie(res);
            next(error);
        }
    },
};
