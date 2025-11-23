import type { Request, Response, NextFunction } from "express";
import type { PodcastConfig } from "../utils/types.ts";
import { validatePrompt } from "../services/validate.service.ts";
import { researchPrompt } from "../services/research.service.ts";
import { generateScript } from "../services/script.service.ts";
import type { ValidateResult, ResearchResult, PodcastEpisode } from "../utils/types.ts";
import { synthesizeSpeech } from "../services/tts.service.ts";

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
  const { prompt, style, duration, user } = req.body;
  const podcastConfig = { prompt, style, duration, user } as PodcastConfig;

  // Perform research and generate a script for the podcast
  const research: ResearchResult = await researchPrompt(podcastConfig);
  const script: PodcastEpisode = await generateScript(
    podcastConfig, 
    JSON.stringify(research)
  );

  // Convert the script into an MP3 audio file
  const synthesizedAudio = await synthesizeSpeech(script);
  const userId = user.id;

  // Store the podcast audio file in Supabase Storage
  const safeTitle = script.title.replace(/[^a-zA-Z0-9-_]/g, "_");
  const filePath = `podcasts/${userId}/${safeTitle}.mp3`;

  const { error: uploadError } = await req.body.supabase.storage
    .from("podcasts")
    .upload(filePath, synthesizedAudio, {
      contentType: "audio/mpeg",
      upsert: true,
    });

  if (uploadError) {
    console.error("Error uploading file:", uploadError);
    res.status(500).json({ error: uploadError.message });
    return;
  }

  // Insert podcast metadata into the Supabase database
  const date = new Date();
  const formattedDate = date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate();

  const { data, error: insertError } = await req.body.supabase
    .from("podcasts")
    .insert({
      created_at: formattedDate,
      title: script.title,
      description: script.description,
      duration: duration,
      style: style,
      url: filePath,
      author: userId,
    })

  if (insertError) {
    console.error("Error inserting DB row:", insertError);
    res.status(500).json({ error: insertError.message });
    return;
  }

  res.status(200).json({ success: true });
}

// POST /api/get-podcasts
export async function getPodcastsController(
  req: Request,
  res: Response
): Promise<void> {
  const user = req.body.user;
  const userId = user.id;

  const { data, error } = await req.body.supabase
    .from("podcasts")
    .select("*")
    .eq("author", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching podcasts:", error);
    res.status(500).json({ error: error.message });
    return;
  }

  // Generate signed URLs for each podcast file (so the client can access them)
  const result: Partial<PodcastEpisode>[] = [];
  for (const podcast of data) {
    let signedUrl: string

    const { data: signedData, error: signError } = await req.body.supabase.storage
      .from("podcasts")
      .createSignedUrl(podcast.url, 60 * 60); // signedUrl valid for 1 hour

    signedUrl = signedData.signedUrl;

    result.push({
      ...podcast,
      url: signedUrl,
    });
  }

  res.status(200).json({ success: true, data: result });
}