import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { env } from "./config/env";
import authRoutes from "./routes/auth.routes";
import { errorHandler } from "./middleware/error.middleware";
import { SocketManager } from "./sockets";

const app = express();
const httpServer = createServer(app);

app.use(cors({
    origin: true,
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
    res.json({ message: "Welcome to MindArena API" });
});

// Routes
app.use("/auth", authRoutes);

// Error handling
app.use(errorHandler);

// Initialize Sockets
new SocketManager(httpServer);

httpServer.listen(env.PORT, () => {
    console.log(`API running at http://localhost:${env.PORT}`);
});
