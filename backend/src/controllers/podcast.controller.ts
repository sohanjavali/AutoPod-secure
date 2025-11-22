import type { Request, Response, NextFunction } from "express";
import type { PodcastConfig } from "../utils/types.ts";
import { validatePrompt } from "../services/validate.service.ts";
import { researchPrompt } from "../services/research.service.ts";
import { generateScript } from "../services/script.service.ts";
import type { ValidateResult, ResearchResult, PodcastTranscript } from "../utils/types.ts";
import { synthesizeSpeech } from "../services/tts.service.ts";
import fs from "fs";

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
  const script: PodcastTranscript = await generateScript(
    podcastConfig, 
    JSON.stringify(research)
  );


  console.log(script);

  const out = fs.createWriteStream("podcast.mp3");
  const stream = await synthesizeSpeech(script);

  stream.pipe(out);

  // res.setHeader("Content-Type", "audio/mpeg");
  // res.setHeader("Content-Disposition", "inline; filename=podcast.mp3");

  // synthesizedAudio.pipe(res);

  console.log("Podcast generation complete.");
  res.status(200).json({
    success: true,
    data: {
      message: "Podcast generation initiated. Check server logs for progress."
    }
  });
}