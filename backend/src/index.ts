// Main server entrypoint

import express from "express";
import cors from "cors";
import { env } from "./config/env.ts";
import healthRoutes from "./routes/health.routes.ts";
import podcastRoutes from "./routes/podcast.routes.ts";
import helmet from "helmet";
import { globalLimiter } from "./middleware/rateLimit.ts";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.ts";

const app = express();

// Global middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(helmet());
app.use(globalLimiter);
app.use(express.json({ limit: "10kb" }));

// Routes
app.use("/api/health", healthRoutes);   // GET /api/health
app.use("/api", podcastRoutes);         // /api/podcasts/* routes

// 404 + central error handler (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(env.PORT, () => {
  console.log(`AutoPod backend running on http://localhost:${env.PORT}`);
});
