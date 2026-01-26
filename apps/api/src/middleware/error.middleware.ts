import { Request, Response, NextFunction } from "express";
import { AuthServiceError } from "../services/auth.service";

export const errorHandler = (
    err: Error, 
    req: Request, 
    res: Response, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    next: NextFunction
) => {
    if (err instanceof AuthServiceError) {
        return res.status(err.statusCode).json({ error: err.message });
    }

    console.error("Unhandled error:", err);
    return res.status(500).json({ error: "Internal server error" });
};
