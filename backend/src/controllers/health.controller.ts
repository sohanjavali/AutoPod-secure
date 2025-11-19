import type { Request, Response } from "express";

/**
 * health.controller.ts
 * - Minimal health/status endpoint controller used for uptime checks
 */
export function healthController(_req: Request, res: Response): void {
  // Return a minimal healthy response. No business logic here.
  res.json({ status: "ok", time: new Date().toISOString() });
}
