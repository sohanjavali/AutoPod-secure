import express from "express";
import type { Request, Response, NextFunction } from "express";
import { generatePodcastController, getPodcastController } from "../controllers/podcast.controller.js";

/**
 * podcast.routes.ts
 * - POST /podcast/generate
 * - GET /podcast/:id
 */
const router = express.Router();

router.post("/generate", async (req: Request, res: Response, next: NextFunction) => {
  return generatePodcastController(req, res, next);
});

router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  return getPodcastController(req, res, next);
});

export default router;
