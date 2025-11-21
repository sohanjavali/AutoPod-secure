// backend/src/controllers/health.controller.ts
import type { Request, Response } from "express";

export function getHealth(_req: Request, res: Response) {
  res.json({
    status: "ok",
    service: "autopod-backend",
    uptime: process.uptime(),
  });
}
