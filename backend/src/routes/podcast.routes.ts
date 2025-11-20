import { Router } from "express";
import {
  generatePodcastController,
  listPodcastsController,
  getPodcastByIdController,
  deletePodcastController,
} from "../controllers/podcast.controller";

const router = Router();

/**
 * POST /api/podcasts/generate
 * Body: { topic: string, duration?: number, style?: string, tone?: string }
 * Returns: full episode object (script, metadata, quiz, etc.)
 */
router.post("/podcasts/generate", generatePodcastController);

/**
 * GET /api/podcasts
 * Returns: list of all generated episodes (in-memory for now)
 */
router.get("/podcasts", listPodcastsController);

/**
 * GET /api/podcasts/:id
 * Returns: single episode by id
 */
router.get("/podcasts/:id", getPodcastByIdController);

/**
 * DELETE /api/podcasts/:id
 * Deletes an episode
 */
router.delete("/podcasts/:id", deletePodcastController);

export default router;
