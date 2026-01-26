import { Request, Response } from "express";
import { env } from "../config/env";

const REFRESH_TOKEN_COOKIE = "refreshToken";

export const setRefreshTokenCookie = (res: Response, token: string): void => {
    res.cookie(REFRESH_TOKEN_COOKIE, token, {
        httpOnly: true,
        secure: env.COOKIE_SECURE,
        sameSite: env.COOKIE_SAME_SITE,
        maxAge: env.REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000,
        path: "/auth",
    });
};

export const clearRefreshTokenCookie = (res: Response): void => {
    res.clearCookie(REFRESH_TOKEN_COOKIE, { path: "/auth" });
};

export const getRefreshTokenFromCookies = (req: Request): string | undefined => {
    return req.cookies[REFRESH_TOKEN_COOKIE];
};
