import { Router } from "express";
import { generatePodcastController, validatePromptController } from "../controllers/podcast.controller.ts";

const router = Router();

// POST /api/validate-prompt - receives podcast topic prompt and validates it
router.post("/validate-prompt", validatePromptController);

// POST /api/generate-podcast - receives podcast parameters and generates a podcast
router.post("/generate-podcast", generatePodcastController);

export default router;
