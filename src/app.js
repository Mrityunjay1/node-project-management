import express from "express";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())
app.use(cors(
    {
        origin: process.env.CORS_ORIGIN?.split(',') || "http://localhost:5173",
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
    }
));

import healthcheckRouter from "./routes/healthcheck.routes.js"
import authRouter from "./routes/auth.routes.js";
import cookieParser from "cookie-parser";

app.use("/api/v1/healthcheck", healthcheckRouter);

app.use("/api/v1/auth", authRouter);

app.get("/", (req, res) => {
    res.send("Hello World!");
});

export default app;