import type { Request, Response, NextFunction } from "express";
import type { PodcastConfig } from "../utils/types.ts";
import { validatePrompt, type ValidateResult } from "../services/validate.service.ts";
import { researchPrompt, type ResearchResult } from "../services/research.service.ts";
import { generateScript, type ScriptResult } from "../services/script.service.ts";


// POST /api/validate-prompt
export async function validatePromptController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { prompt } = req.body as { prompt: string };
  const validated: ValidateResult = await validatePrompt(prompt);
  
  res.status(200).json({
    success: true,
    data: validated,
  });
}

// POST /api/generate-podcast
export async function generatePodcastController(
  req: Request,
  res: Response
): Promise<void> {
  const podcastConfig = req.body as PodcastConfig;
  const research: ResearchResult = await researchPrompt(podcastConfig);
  const script: ScriptResult = await generateScript(podcastConfig, JSON.stringify(research));

  console.log(script);
}