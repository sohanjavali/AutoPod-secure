import type { Request, Response, NextFunction } from "express";

/**
 * error.middleware.ts
 * - Centralized error handling middleware
 * - Should format errors (consistent JSON shape), handle known error types, and hide internals
 */

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  // TODO: implement structured error handling and logging
  // For the scaffold, just return a 500 with a generic message
  console.error(err);
  res.status(500).json({ error: "internal_server_error" });
}

export default errorHandler;
