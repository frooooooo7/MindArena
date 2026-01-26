import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import authRoutes from "./routes/auth.routes";
import { errorHandler } from "./middleware/error.middleware";

const app = express();

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

app.listen(env.PORT, () => {
    console.log(`API running at http://localhost:${env.PORT}`);
});
