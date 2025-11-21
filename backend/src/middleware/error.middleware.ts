// backend/src/middleware/error.middleware.ts
import type { NextFunction, Request, Response } from "express";
import logger from "../utils/logger";

export function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  logger.error("[ERROR MIDDLEWARE]", err);
  const message = err instanceof Error ? err.message : "Unknown error";
  res.status(500).json({ error: "Internal Server Error", message });
}
