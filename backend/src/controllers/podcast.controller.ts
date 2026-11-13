import type { Request, Response } from "express";
import type { PodcastEpisode } from "../utils/types.ts";
import { validatePrompt } from "../services/validate.service.ts";
import { generateEpisode } from "../services/pipeline.service.ts";
import { synthesizeSpeech } from "../services/tts.service.ts";
import type { AppLocals } from "../middleware/locals.ts";
import type { GenerateBody, ValidateBody } from "../schemas/podcast.schema.ts";

// POST /api/validate-prompt
export async function validatePromptController(
  _req: Request,
  res: Response<any, AppLocals>
): Promise<void> {
  const { prompt } = res.locals.body as ValidateBody;
  const validated = await validatePrompt(prompt);

  res.status(200).json({
    success: true,
    data: validated,
  });
}

// POST /api/generate-podcast
export async function generatePodcastController(
  _req: Request,
  res: Response<any, AppLocals>
): Promise<void> {
  const { prompt, style, duration } = res.locals.body as GenerateBody;
  const user = res.locals.user!;
  const supabase = res.locals.supabase!;

  // Re-validate the prompt server-side
  const validated = await validatePrompt(prompt);
  if (!validated.isValid) {
    res.status(400).json({ error: validated.reason });
    return;
  }

  // Research, script, and guardrails happen inside the pipeline
  const script: PodcastEpisode = await generateEpisode({
    topic: validated.sanitizedTopic,
    style,
    duration,
  });

  // Convert the script into an MP3 audio file
  const synthesizedAudio = await synthesizeSpeech(script);
  const userId = user.id;

  // Store the podcast audio file in Supabase Storage
  const safeTitle = script.title.replace(/[^a-zA-Z0-9-_]/g, "_");
  const filePath = `podcasts/${userId}/${safeTitle}.mp3`;

  const { error: uploadError } = await supabase.storage
    .from("podcasts")
    .upload(filePath, synthesizedAudio, {
      contentType: "audio/mpeg",
      upsert: true,
    });

  if (uploadError) {
    throw new Error(`Storage upload failed: ${uploadError.message}`);
  }

  // Insert podcast metadata into the Supabase database
  const date = new Date();
  const formattedDate = date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate();

  // Stored style keeps the capitalized label the frontend/library use
  const storedStyle = style.charAt(0).toUpperCase() + style.slice(1);

  const { error: insertError } = await supabase
    .from("podcasts")
    .insert({
      created_at: formattedDate,
      title: script.title,
      description: script.description,
      duration: duration,
      style: storedStyle,
      url: filePath,
      author: userId,
    });

  if (insertError) {
    throw new Error(`DB insert failed: ${insertError.message}`);
  }

  res.status(200).json({ success: true });
}

// POST /api/get-podcasts
export async function getPodcastsController(
  _req: Request,
  res: Response<any, AppLocals>
): Promise<void> {
  const userId = res.locals.user!.id;
  const supabase = res.locals.supabase!;

  const { data, error } = await supabase
    .from("podcasts")
    .select("*")
    .eq("author", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Fetching podcasts failed: ${error.message}`);
  }

  // Generate signed URLs for each podcast file (so the client can access them)
  const result: Partial<PodcastEpisode>[] = [];
  for (const podcast of data ?? []) {
    const { data: signedData, error: signError } = await supabase.storage
      .from("podcasts")
      .createSignedUrl(podcast.url, 60 * 60); // signedUrl valid for 1 hour

    // Skip items whose audio can't be signed rather than failing the whole list
    if (signError || !signedData) {
      console.error("Error signing URL for podcast", podcast.id, signError?.message);
      continue;
    }

    result.push({
      ...podcast,
      url: signedData.signedUrl,
    });
  }

  res.status(200).json({ success: true, data: result });
}
