// Main server entrypoint

import express from "express";
import cors from "cors";
import { loadConfig } from "./config/env.ts"
import healthRoutes from "./routes/health.routes.ts";
import podcastRoutes from "./routes/podcast.routes.ts";

const app = express();
const env = loadConfig();

// Global middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/health", healthRoutes);   // GET /api/health
app.use("/api", podcastRoutes);         // /api/podcasts/* routes

// Start server
app.listen(env.PORT, () => {
  console.log(`AutoPod backend running on http://localhost:${env.PORT}`);
});
