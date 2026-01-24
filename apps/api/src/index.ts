import express from "express";
import cors from "cors";

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({ message: "Welcome to MindArena API" });
});

app.listen(port, () => {
    console.log(`API running at http://localhost:${port}`);
});
