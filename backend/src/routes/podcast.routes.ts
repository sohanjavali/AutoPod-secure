import { Router } from "express";
import { generatePodcastController } from "../controllers/podcast.controller.ts";

const router = Router();

// POST /api/generate-podcast - receives podcast parameters and generates a podcast
router.post("/generate-podcast", generatePodcastController);

export default router;
