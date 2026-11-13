// Main server entrypoint

import express from "express";
import cors from "cors";
import { env } from "./config/env.ts";
import healthRoutes from "./routes/health.routes.ts";
import podcastRoutes from "./routes/podcast.routes.ts";
import helmet from "helmet";
import { globalLimiter } from "./middleware/rateLimit.ts";
import { randomUUID } from "node:crypto";
import { pinoHttp } from "pino-http";
import { logger, clip } from "./lib/logger.ts";
import { requestContextMiddleware } from "./lib/requestContext.ts";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.ts";

const app = express();

// Request id + structured request logging (method, path, status, duration only)
const REQ_ID_RE = /^[A-Za-z0-9_-]{8,64}$/;
app.use(pinoHttp({
  logger,
  genReqId: (req, res) => {
    const incoming = req.headers["x-request-id"];
    const id = typeof incoming === "string" && REQ_ID_RE.test(incoming) ? incoming : randomUUID();
    res.setHeader("x-request-id", id);
    return id;
  },
  customAttributeKeys: { responseTime: "durationMs" },
  customProps: (req) => ({ requestId: String(req.id) }),
  autoLogging: { ignore: (req) => (req.url ?? "").split("?")[0] === "/api/health" },
  customLogLevel: (_req, res, err) => (err || res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info"),
  serializers: {
    req: (req) => ({ method: req.method, url: String(req.url ?? "").split("?")[0] }),
    res: (res) => ({ status: res.statusCode }),
    err: (err) => ({ type: err?.name, message: clip(err?.message) }),
  },
}));

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
app.use(requestContextMiddleware);

// Routes
app.use("/api/health", healthRoutes);   // GET /api/health
app.use("/api", podcastRoutes);         // /api/podcasts/* routes

// 404 + central error handler (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(env.PORT, () => {
  logger.info({ event: "startup", port: env.PORT }, `AutoPod backend running on http://localhost:${env.PORT}`);
});
