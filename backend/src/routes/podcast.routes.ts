import { Router } from "express";
import { generatePodcastController, validatePromptController, getPodcastsController } from "../controllers/podcast.controller.ts";
import { authMiddleware } from "../middleware/authMiddleware.ts";
import { validateBody } from "../middleware/validate.ts";
import { generateLimiter, validateLimiter } from "../middleware/rateLimit.ts";
import { ValidateBodySchema, GenerateBodySchema } from "../schemas/podcast.schema.ts";

const router = Router();

// POST /api/validate-prompt - receives podcast topic prompt and validates it
router.post("/validate-prompt", authMiddleware, validateLimiter, validateBody(ValidateBodySchema), validatePromptController);

// POST /api/generate-podcast - receives podcast parameters and generates a podcast
router.post("/generate-podcast", authMiddleware, generateLimiter, validateBody(GenerateBodySchema), generatePodcastController);

// POST /api/get-podcasts - get list of podcasts for the authenticated user
router.post("/get-podcasts", authMiddleware, getPodcastsController);


export default router;
