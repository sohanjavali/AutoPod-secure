// backend/src/index.ts
// Main server entrypoint for AutoPod

import express from "express";
import cors from "cors";

import { env } from "./config/env";
import logger from "./utils/logger";

import healthRoutes from "./routes/health.routes";
import authRoutes from "./routes/auth.routes";
import podcastRoutes from "./routes/podcast.routes";

import { authMiddleware } from "./middleware/auth.middleware";
import { errorMiddleware } from "./middleware/error.middleware";

const app = express();

// ---------- Global middleware ----------
app.use(cors());
app.use(express.json());

// Simple request logger (optional but useful)
app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// If you want auth on all routes, uncomment this:
// app.use(authMiddleware);

// ---------- Routes ----------
app.use("/api/health", healthRoutes);   // GET /api/health
app.use("/api/auth", authRoutes);       // POST /api/auth/login
app.use("/api", podcastRoutes);         // /api/podcasts/* routes

// ---------- Error handling ----------
app.use(errorMiddleware);

// ---------- Start server ----------
app.listen(env.port, () => {
  logger.info(`🚀 AutoPod backend running on http://localhost:${env.port}`);
});
