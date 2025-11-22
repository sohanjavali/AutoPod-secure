// backend/src/controllers/podcast.controller.ts
import type { Request, Response, NextFunction } from "express";
import type { GeneratePodcastRequest } from "../utils/types.ts";
import { validatePrompt, type ValidateResult } from "../services/validate.service.ts";
// import { generateScript } from "../services/script.service.js";
// import { getResearchNotes } from "../services/research.service";
// import { synthesizeAudio } from "../services/tts.service";
// import {
//   saveEpisode,
//   getAllEpisodes,
//   getEpisodeById,
//   deleteEpisode,
// } from "../services/db.service";
// import type { PodcastEpisode } from "../utils/types";


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
  const { prompt, style, duration, language } = req.body as GeneratePodcastRequest;

  console.log({ prompt, style, duration, language });

  // try {
  //   const {
  //     topic,
  //     duration = 15,
  //     style = "monologue",
  //     tone = "Calm Professor",
  //     difficulty = "mixed",
  //   } = req.body as GeneratePodcastRequest;

    // --------- Validation ----------
  //   if (!topic || typeof topic !== "string" || !topic.trim()) {
  //     res.status(400).json({
  //       error: "Invalid request",
  //       message: "Field 'topic' is required and must be a non-empty string",
  //     });
  //     return;
  //   }

  //   if (duration && (typeof duration !== "number" || duration <= 0)) {
  //     res.status(400).json({
  //       error: "Invalid request",
  //       message: "Field 'duration' must be a positive number (in minutes)",
  //     });
  //     return;
  //   }

  //   if (style && typeof style !== "string") {
  //     res.status(400).json({
  //       error: "Invalid request",
  //       message: "Field 'style' must be a string",
  //     });
  //     return;
  //   }

  //   logger.info(
  //     `[podcast] Generating episode: topic="${topic}", duration=${duration}, style="${style}", tone="${tone}", difficulty="${difficulty}"`
  //   );

  //   // 1. Optional: background research
  //   const researchNotes = await getResearchNotes(topic);

  //   // 2. Generate script with Claude
  //   const scriptResult = await generateScript(
  //     topic,
  //     duration,
  //     style,
  //     researchNotes
  //   );

  //   // 3. Optional: TTS (returns null for now if not implemented)
  //   const audioUrl = await synthesizeAudio(scriptResult.script);

  //   // 4. Build episode object
  //   const episode: PodcastEpisode = {
  //     id: uuidv4(),
  //     topic,
  //     title: scriptResult.title,
  //     description: scriptResult.description,
  //     duration_minutes: duration,
  //     difficulty,
  //     tone,
  //     style,
  //     voices: scriptResult.voices,
  //     script: scriptResult.script,
  //     key_takeaways: scriptResult.key_takeaways,
  //     quiz: scriptResult.quiz,
  //     audio_url: audioUrl,
  //     created_at: new Date().toISOString(),
  //   };

  //   // 5. Save in in-memory DB
  //   saveEpisode(episode);

  //   // 6. Respond to client
  //   res.status(201).json({
  //     success: true,
  //     message: "Podcast generated successfully",
  //     data: episode,
  //   });
  // } catch (error) {
  //   logger.error(
  //     `[podcast] Error in generatePodcastController: ${
  //       error instanceof Error ? error.message : String(error)
  //     }`
  //   );
  //   next(error);
  // }
}

/**
 * GET /api/podcasts
 */
// export function listPodcastsController(_req: Request, res: Response) {
//   const episodes = getAllEpisodes();
//   res.status(200).json({
//     success: true,
//     data: episodes,
//   });
// }

/**
 * GET /api/podcasts/:id
 */
// export function getPodcastByIdController(req: Request, res: Response) {
//   const { id } = req.params;

//   const episode = getEpisodeById(id);
//   if (!episode) {
//     return res.status(404).json({
//       success: false,
//       error: "Episode not found",
//     });
//   }

//   res.status(200).json({
//     success: true,
//     data: episode,
//   });
// }

/**
 * DELETE /api/podcasts/:id
 */
// export function deletePodcastController(req: Request, res: Response) {
//   const { id } = req.params;

//   const existing = getEpisodeById(id);
//   if (!existing) {
//     return res.status(404).json({
//       success: false,
//       error: "Episode not found",
//     });
//   }

//   deleteEpisode(id);

//   res.status(204).send();
// }
