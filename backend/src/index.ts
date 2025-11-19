import express from "express";
import type { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.routes.js";
import podcastRoutes from "./routes/podcast.routes.js";
import healthRoutes from "./routes/health.routes.js";
import errorHandler from "./middleware/error.middleware.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get("/", (_req: Request, res: Response) => {
	res.json({ status: "ok", timestamp: Date.now() });
});

// Routes
app.use("/auth", authRoutes);
app.use("/podcast", podcastRoutes);
app.use("/health", healthRoutes);

// Error handler (should be last)
app.use(errorHandler);

const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;
app.listen(PORT, () => {
	// eslint-disable-next-line no-console
	console.log(`Backend server listening on http://localhost:${PORT}`);
});

export default app;
