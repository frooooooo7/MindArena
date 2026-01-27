import { Socket, ExtendedError } from "socket.io";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import { userRepository } from "../../repositories/user.repository";

interface JwtPayload {
    userId: string;
}

/**
 * Socket.io middleware to authenticate connections using JWT
 */
export async function socketAuthMiddleware(
    socket: Socket, 
    next: (err?: ExtendedError) => void
) {
    try {
        const token = socket.handshake.auth.token;

        if (!token) {
            console.log("[SOCKET AUTH] No token provided");
            return next(new Error("Authentication required"));
        }

        // Verify the JWT token
        const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

        if (!decoded.userId) {
            return next(new Error("Invalid token payload"));
        }

        // Fetch user from database
        const user = await userRepository.findById(decoded.userId);

        if (!user) {
            return next(new Error("User not found"));
        }

        // Attach user data to socket for use in handlers
        socket.data.user = {
            id: user.id,
            name: user.name,
            email: user.email,
        };

        console.log(`[SOCKET AUTH] User ${user.name} authenticated`);
        next();
    } catch (error) {
        console.error("[SOCKET AUTH] Authentication failed:", error);
        
        if (error instanceof jwt.TokenExpiredError) {
            return next(new Error("Token expired"));
        }
        
        if (error instanceof jwt.JsonWebTokenError) {
            return next(new Error("Invalid token"));
        }

        return next(new Error("Authentication failed"));
    }
}
