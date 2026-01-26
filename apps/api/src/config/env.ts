import dotenv from "dotenv";

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";

export const env = {
    NODE_ENV: process.env.NODE_ENV || "development",
    PORT: parseInt(process.env.PORT || "3001", 10),
    JWT_SECRET: process.env.JWT_SECRET || "mindarena-secret-key-change-in-production",
    SALT_ROUNDS: parseInt(process.env.SALT_ROUNDS || "10", 10),
    
    // Token expiration
    ACCESS_TOKEN_EXPIRES_IN: "15m",
    REFRESH_TOKEN_EXPIRES_DAYS: 7,
    
    // Cookie config
    COOKIE_SECURE: isProduction,
    COOKIE_SAME_SITE: "lax" as const,
} as const;
