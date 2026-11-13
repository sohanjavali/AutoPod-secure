// Main server entrypoint

import express from "express";
import cors from "cors";
import { env } from "./config/env.ts";
import healthRoutes from "./routes/health.routes.ts";
import podcastRoutes from "./routes/podcast.routes.ts";
import { rateLimit } from "express-rate-limit";

const app = express();

// Global middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Rate Limit
// const limiter = rateLimit({
//   windowMs: 60 * 60 * 1000, // 60 minutes
//   max: 3, // Limit each IP to 3 requests per 60 minutes
//   message: "You have reached your limit. Please try again after 60 minutes",
//   standardHeaders: true,
//   legacyHeaders: false
// });

// Routes
app.use("/api/health", healthRoutes);   // GET /api/health
app.use("/api", podcastRoutes);         // /api/podcasts/* routes

// Start server
app.listen(env.PORT, () => {
  console.log(`AutoPod backend running on http://localhost:${env.PORT}`);
});
